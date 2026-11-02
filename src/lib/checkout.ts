import 'server-only'

import type { Payload } from 'payload'
import type Stripe from 'stripe'
import { z } from 'zod'

import { MAX_CART_LINES, MAX_QTY_PER_LINE, sizeLabel } from './constants'
import { firstMedia, mediaSrc } from './media'
import { toMinorUnits } from './money'
import { generateOrderNumber } from './orders'
import { type CartLineInput, type PricedCart, priceCart, type PricingProduct } from './pricing'
import { getStripe } from './stripe'
import { absoluteUrl, getServerSideURL } from './urls'

export const cartLinesSchema = z
  .array(
    z.object({
      productId: z.number().int().positive(),
      variantId: z.string().min(1).max(64),
      quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
    }),
  )
  .min(1)
  .max(MAX_CART_LINES)

export async function loadPricingProducts(
  payload: Payload,
  productIds: number[],
): Promise<PricingProduct[]> {
  if (!productIds.length) return []
  const result = await payload.find({
    collection: 'products',
    where: { id: { in: Array.from(new Set(productIds)) } },
    depth: 1,
    limit: productIds.length,
    pagination: false,
    overrideAccess: true,
    select: { title: true, slug: true, price: true, status: true, variants: true, images: true },
  })
  return result.docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    price: doc.price,
    status: doc.status,
    image: mediaSrc(firstMedia(doc.images), 'thumbnail'),
    variants: (doc.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size,
      sku: v.sku,
      stock: v.stock ?? 0,
    })),
  }))
}

export async function priceCartFromDatabase(
  payload: Payload,
  lines: CartLineInput[],
): Promise<PricedCart> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
  const products = await loadPricingProducts(
    payload,
    lines.map((line) => line.productId),
  )
  return priceCart(lines, products, {
    shippingRate: settings?.shippingRate ?? 0,
    freeShippingThreshold: settings?.freeShippingThreshold ?? null,
  })
}

const publicImageUrl = (path: string | null): string[] => {
  // Stripe can only display images it can download over HTTPS.
  if (!path || !getServerSideURL().startsWith('https://')) return []
  return [absoluteUrl(path)]
}

export type CheckoutResult =
  | { ok: true; url: string; cart: PricedCart }
  | { ok: false; reason: 'issues'; cart: PricedCart }
  | { ok: false; reason: 'error'; message: string }

export async function createCheckout(
  payload: Payload,
  lines: CartLineInput[],
): Promise<CheckoutResult> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
  const cart = await priceCartFromDatabase(payload, lines)
  if (cart.issues.length > 0 || cart.lines.length === 0)
    return { ok: false, reason: 'issues', cart }

  const currency = (settings?.currency || 'USD').toLowerCase()
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === 'true'
  // With Stripe Tax, say whether shop prices already include tax (default) or tax is added on top.
  const taxBehavior = automaticTax
    ? process.env.STRIPE_TAX_BEHAVIOR === 'exclusive'
      ? ('exclusive' as const)
      : ('inclusive' as const)
    : undefined
  const stripe = getStripe()

  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      orderNumber: generateOrderNumber(),
      status: 'pending',
      currency: currency.toUpperCase(),
      items: cart.lines.map((line) => ({
        product: line.productId,
        title: line.title,
        variantId: line.variantId,
        size: line.size as never,
        sku: line.sku,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
      })),
      subtotal: cart.subtotal,
      shippingTotal: cart.shipping,
      total: cart.total,
    },
  })

  const deliveryEstimate =
    settings?.deliveryEstimate?.min && settings.deliveryEstimate.max
      ? {
          minimum: { unit: 'business_day' as const, value: settings.deliveryEstimate.min },
          maximum: { unit: 'business_day' as const, value: settings.deliveryEstimate.max },
        }
      : undefined

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    client_reference_id: String(order.id),
    metadata: { orderId: String(order.id), orderNumber: order.orderNumber },
    payment_intent_data: {
      metadata: { orderId: String(order.id), orderNumber: order.orderNumber },
    },
    line_items: cart.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency,
        unit_amount: toMinorUnits(line.unitPrice),
        tax_behavior: taxBehavior,
        product_data: {
          name: line.title,
          description: `Size: ${sizeLabel(line.size)}`,
          images: publicImageUrl(line.image),
          metadata: {
            productId: String(line.productId),
            variantId: line.variantId,
            sku: line.sku ?? '',
          },
        },
      },
    })),
    shipping_address_collection: {
      allowed_countries: (settings?.shippingCountries?.length
        ? settings.shippingCountries
        : ['US']) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: cart.shipping === 0 ? 'Free standard shipping' : 'Standard shipping',
          fixed_amount: { amount: toMinorUnits(cart.shipping), currency },
          tax_behavior: taxBehavior,
          delivery_estimate: deliveryEstimate,
        },
      },
    ],
    phone_number_collection: { enabled: true },
    allow_promotion_codes: Boolean(settings?.allowPromotionCodes) || undefined,
    automatic_tax: { enabled: automaticTax },
    billing_address_collection: 'auto',
    // Customers have an hour to complete payment; the order is marked abandoned afterwards.
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    success_url: `${getServerSideURL()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getServerSideURL()}/cart?checkout=cancelled`,
  }

  try {
    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: `order-${order.id}`,
    })
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { stripeCheckoutSessionId: session.id },
      overrideAccess: true,
    })
    if (!session.url) throw new Error('Stripe did not return a checkout URL')
    return { ok: true, url: session.url, cart }
  } catch (err) {
    payload.logger.error({
      err,
      msg: `Could not create Stripe Checkout session for order ${order.orderNumber}`,
    })
    await payload
      .delete({ collection: 'orders', id: order.id, overrideAccess: true })
      .catch(() => undefined)
    return {
      ok: false,
      reason: 'error',
      message: 'We could not start the checkout. Please try again.',
    }
  }
}
