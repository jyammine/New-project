import 'server-only'

import { sql } from '@payloadcms/db-postgres'
import { randomInt } from 'crypto'
import type { Payload } from 'payload'
import type Stripe from 'stripe'

import { sendOrderEmails } from '@/emails/send'
import type { Order } from '@/payload-types'

import { fromMinorUnits } from './money'
import { CACHE_TAGS, revalidateTags } from './revalidate'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateOrderNumber(date = new Date()): string {
  const y = String(date.getUTCFullYear()).slice(2)
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const suffix = Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return `LN-${y}${m}${d}-${suffix}`
}

type Drizzle = {
  execute: (query: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }>
}

const db = (payload: Payload): Drizzle => (payload.db as unknown as { drizzle: Drizzle }).drizzle

/**
 * Atomically move an order from one status to another. Returns false when the order was
 * not in the expected status — this makes Stripe webhook retries idempotent.
 */
export async function transitionOrderStatus(
  payload: Payload,
  orderId: number,
  from: Order['status'],
  to: Order['status'],
): Promise<boolean> {
  const result = await db(payload).execute(
    sql`UPDATE "orders" SET "status" = ${to}, "updated_at" = now() WHERE "id" = ${orderId} AND "status" = ${from} RETURNING "id"`,
  )
  return result.rows.length > 0
}

/** Decrement stock for one variant without going below zero. Returns true if there was enough. */
export async function decrementVariantStock(
  payload: Payload,
  variantId: string,
  quantity: number,
): Promise<boolean> {
  const result = await db(payload).execute(
    sql`UPDATE "products_variants" SET "stock" = "stock" - ${quantity} WHERE "id" = ${variantId} AND "stock" >= ${quantity} RETURNING "id"`,
  )
  if (result.rows.length > 0) return true
  // Not enough left (oversold between checkout and payment): clear what remains and flag the order.
  await db(payload).execute(
    sql`UPDATE "products_variants" SET "stock" = 0 WHERE "id" = ${variantId}`,
  )
  return false
}

const findOrder = async (
  payload: Payload,
  session: Stripe.Checkout.Session,
): Promise<Order | null> => {
  const orderId = Number(session.metadata?.orderId || session.client_reference_id)
  if (Number.isInteger(orderId) && orderId > 0) {
    try {
      return await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      // fall through to lookup by session id
    }
  }
  const result = await payload.find({
    collection: 'orders',
    where: { stripeCheckoutSessionId: { equals: session.id } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

/**
 * Mark the order for a paid Checkout Session as paid, record customer details, reduce stock
 * and send confirmation emails. Safe to call several times for the same session.
 */
export async function fulfillCheckoutSession(
  payload: Payload,
  session: Stripe.Checkout.Session,
): Promise<{ order: Order | null; processed: boolean }> {
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return { order: null, processed: false }
  }

  const order = await findOrder(payload, session)
  if (!order) {
    payload.logger.error({ msg: `Stripe session ${session.id} has no matching order` })
    return { order: null, processed: false }
  }

  // Abandoned orders can still be paid if the customer completes an async payment late.
  const claimed =
    (await transitionOrderStatus(payload, order.id, 'pending', 'paid')) ||
    (await transitionOrderStatus(payload, order.id, 'abandoned', 'paid'))
  if (!claimed) return { order, processed: false }

  let stockWarning = false
  const productIds = new Set<number>()
  for (const item of order.items ?? []) {
    const ok = await decrementVariantStock(payload, item.variantId, item.quantity)
    if (!ok) stockWarning = true
    const productId = typeof item.product === 'object' ? item.product?.id : item.product
    if (productId) productIds.add(productId)
  }

  const customer = session.customer_details
  const shipping = session.collected_information?.shipping_details
  const address = shipping?.address ?? customer?.address

  const updated = await payload.update({
    collection: 'orders',
    id: order.id,
    overrideAccess: true,
    context: { disableRevalidate: true },
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
      email: customer?.email ?? order.email,
      customerName: shipping?.name || customer?.name || order.customerName,
      phone: customer?.phone ?? order.phone,
      shippingAddress: {
        name: shipping?.name ?? customer?.name ?? null,
        line1: address?.line1 ?? null,
        line2: address?.line2 ?? null,
        city: address?.city ?? null,
        state: address?.state ?? null,
        postalCode: address?.postal_code ?? null,
        country: address?.country ?? null,
      },
      shippingTotal: fromMinorUnits(session.shipping_cost?.amount_total ?? 0),
      taxTotal: fromMinorUnits(session.total_details?.amount_tax ?? 0),
      discountTotal: fromMinorUnits(session.total_details?.amount_discount ?? 0),
      total: fromMinorUnits(session.amount_total ?? 0),
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      stockWarning,
    },
  })

  if (stockWarning) {
    payload.logger.warn({
      msg: `Order ${updated.orderNumber} was paid but some items were out of stock`,
    })
  }

  // Stock changed, so cached product pages need refreshing.
  revalidateTags([CACHE_TAGS.products])

  try {
    await sendOrderEmails(payload, updated)
  } catch (err) {
    payload.logger.error({ err, msg: `Failed to send order emails for ${updated.orderNumber}` })
  }

  return { order: updated, processed: true }
}

/** Mark a pending order as abandoned when its Checkout Session expires or payment fails. */
export async function abandonCheckoutSession(
  payload: Payload,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const order = await findOrder(payload, session)
  if (order) await transitionOrderStatus(payload, order.id, 'pending', 'abandoned')
}

/** Mark an order as refunded when the charge is fully refunded in Stripe. */
export async function markRefunded(payload: Payload, paymentIntentId: string): Promise<void> {
  const result = await payload.find({
    collection: 'orders',
    where: { stripePaymentIntentId: { equals: paymentIntentId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const order = result.docs[0]
  if (!order || order.status === 'refunded') return
  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { status: 'refunded' },
    overrideAccess: true,
  })
}
