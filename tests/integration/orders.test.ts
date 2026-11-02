import Stripe from 'stripe'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { POST as webhook } from '@/app/(frontend)/api/stripe/webhook/route'
import { priceCartFromDatabase } from '@/lib/checkout'
import { abandonCheckoutSession, fulfillCheckoutSession, generateOrderNumber } from '@/lib/orders'
import type { Order, Product } from '@/payload-types'

import { createProduct, getTestPayload, resetDatabase } from './helpers'

type Payload = Awaited<ReturnType<typeof getTestPayload>>

let payload: Payload

beforeAll(async () => {
  payload = await getTestPayload()
})

beforeEach(async () => {
  await resetDatabase(payload)
})

const createPendingOrder = async (
  product: Product,
  quantity: number,
  variantIndex = 0,
): Promise<Order> => {
  const variant = product.variants[variantIndex]!
  return payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      orderNumber: generateOrderNumber(),
      status: 'pending',
      currency: 'USD',
      items: [
        {
          product: product.id,
          title: product.title,
          variantId: variant.id!,
          size: variant.size,
          sku: variant.sku,
          unitPrice: product.price,
          quantity,
        },
      ],
      subtotal: product.price * quantity,
      total: product.price * quantity,
      stripeCheckoutSessionId: `cs_test_${Math.random().toString(36).slice(2)}`,
    },
  })
}

const fakeSession = (order: Order, overrides: Partial<Stripe.Checkout.Session> = {}) =>
  ({
    id: order.stripeCheckoutSessionId,
    object: 'checkout.session',
    payment_status: 'paid',
    status: 'complete',
    client_reference_id: String(order.id),
    metadata: { orderId: String(order.id), orderNumber: order.orderNumber },
    amount_total: Math.round(order.total * 100) + 595,
    shipping_cost: { amount_total: 595 },
    total_details: { amount_tax: 0, amount_discount: 0, amount_shipping: 595 },
    payment_intent: 'pi_test_123',
    customer_details: {
      email: 'parent@example.com',
      name: 'Sam Parent',
      phone: '+15550100',
      address: null,
    },
    collected_information: {
      shipping_details: {
        name: 'Sam Parent',
        address: {
          line1: '1 Main St',
          line2: null,
          city: 'Portland',
          state: 'OR',
          postal_code: '97201',
          country: 'US',
        },
      },
    },
    ...overrides,
  }) as unknown as Stripe.Checkout.Session

const stockOf = async (productId: number, index = 0) => {
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    overrideAccess: true,
    depth: 0,
  })
  return product.variants[index]!.stock
}

describe('pricing from the database', () => {
  it('ignores hidden products and reports stock problems', async () => {
    const active = await createProduct(payload, { price: 18.5, stock: [3, 0] })
    const hidden = await createProduct(payload, { status: 'draft' })
    const cart = await priceCartFromDatabase(payload, [
      { productId: active.id, variantId: active.variants[0]!.id!, quantity: 2 },
      { productId: active.id, variantId: active.variants[1]!.id!, quantity: 1 },
      { productId: hidden.id, variantId: hidden.variants[0]!.id!, quantity: 1 },
    ])
    expect(cart.lines).toHaveLength(1)
    expect(cart.subtotal).toBe(37)
    expect(cart.issues.map((i) => i.type).sort()).toEqual(['out_of_stock', 'unavailable'])
  })

  it('generates SKUs for variants', async () => {
    const product = await createProduct(payload, { slug: 'tiny-hat' })
    expect(product.variants.map((v) => v.sku)).toEqual(['TINY-HAT-0-3M', 'TINY-HAT-3-6M'])
  })
})

describe('fulfilling paid checkout sessions', () => {
  it('marks the order paid, saves customer details and reduces stock exactly once', async () => {
    const product = await createProduct(payload, { stock: [5, 1] })
    const order = await createPendingOrder(product, 2)
    const session = fakeSession(order)

    const first = await fulfillCheckoutSession(payload, session)
    expect(first.processed).toBe(true)
    expect(first.order).toMatchObject({
      status: 'paid',
      email: 'parent@example.com',
      customerName: 'Sam Parent',
      shippingTotal: 5.95,
      stockWarning: false,
      shippingAddress: { line1: '1 Main St', city: 'Portland', country: 'US' },
    })
    expect(first.order?.paidAt).toBeTruthy()
    expect(await stockOf(product.id)).toBe(3)

    // Stripe retries webhooks; a second delivery must not change anything.
    const second = await fulfillCheckoutSession(payload, session)
    expect(second.processed).toBe(false)
    expect(await stockOf(product.id)).toBe(3)
  })

  it('flags orders that were oversold between checkout and payment', async () => {
    const product = await createProduct(payload, { stock: [5, 1] })
    const order = await createPendingOrder(product, 3, 1)
    const result = await fulfillCheckoutSession(payload, fakeSession(order))
    expect(result.order?.stockWarning).toBe(true)
    expect(await stockOf(product.id, 1)).toBe(0)
  })

  it('does nothing for unpaid sessions', async () => {
    const product = await createProduct(payload)
    const order = await createPendingOrder(product, 1)
    const result = await fulfillCheckoutSession(
      payload,
      fakeSession(order, { payment_status: 'unpaid' }),
    )
    expect(result.processed).toBe(false)
    expect(await stockOf(product.id)).toBe(5)
  })

  it('marks expired sessions as abandoned', async () => {
    const product = await createProduct(payload)
    const order = await createPendingOrder(product, 1)
    await abandonCheckoutSession(
      payload,
      fakeSession(order, { status: 'expired', payment_status: 'unpaid' }),
    )
    const updated = await payload.findByID({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
    })
    expect(updated.status).toBe('abandoned')
  })
})

describe('Stripe webhook endpoint', () => {
  const stripe = new Stripe('sk_test_integration')
  const signedRequest = (event: object, secret = process.env.STRIPE_WEBHOOK_SECRET!) => {
    const body = JSON.stringify(event)
    const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret })
    return new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body,
      headers: { 'stripe-signature': signature, 'content-type': 'application/json' },
    })
  }

  it('rejects requests without a valid signature', async () => {
    const unsigned = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    })
    expect((await webhook(unsigned)).status).toBe(400)
    const forged = signedRequest({ id: 'evt_1', type: 'checkout.session.completed' }, 'whsec_wrong')
    expect((await webhook(forged)).status).toBe(400)
  })

  it('fulfils an order from a signed checkout.session.completed event', async () => {
    const product = await createProduct(payload, { stock: [4, 0] })
    const order = await createPendingOrder(product, 1)
    const event = {
      id: 'evt_test_1',
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: fakeSession(order) },
    }
    const response = await webhook(signedRequest(event))
    expect(response.status).toBe(200)
    const updated = await payload.findByID({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
    })
    expect(updated.status).toBe('paid')
    expect(await stockOf(product.id)).toBe(3)
  })
})

describe('access control', () => {
  it('hides orders, messages and subscribers from the public API', async () => {
    for (const collection of ['orders', 'inquiries', 'subscribers', 'users'] as const) {
      await expect(payload.find({ collection, overrideAccess: false })).rejects.toThrow()
    }
    await expect(
      payload.create({
        collection: 'subscribers',
        data: { email: 'spam@example.com' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('only shows active products to visitors', async () => {
    await createProduct(payload, { status: 'active' })
    await createProduct(payload, { status: 'draft' })
    const visible = await payload.find({ collection: 'products', overrideAccess: false })
    expect(visible.docs).toHaveLength(1)
    expect(visible.docs[0]?.status).toBe('active')
  })

  it('makes the first staff account an administrator', async () => {
    const first = await payload.create({
      collection: 'users',
      data: { email: 'owner@example.com', password: 'a-strong-password-1', roles: ['editor'] },
      overrideAccess: true,
    })
    const second = await payload.create({
      collection: 'users',
      data: { email: 'helper@example.com', password: 'a-strong-password-2', roles: ['editor'] },
      overrideAccess: true,
    })
    expect(first.roles).toEqual(['admin'])
    expect(second.roles).toEqual(['editor'])
  })

  it('does not let editors promote themselves', async () => {
    await payload.create({
      collection: 'users',
      data: { email: 'owner@example.com', password: 'a-strong-password-1', roles: ['admin'] },
      overrideAccess: true,
    })
    const editor = await payload.create({
      collection: 'users',
      data: { email: 'editor@example.com', password: 'a-strong-password-2', roles: ['editor'] },
      overrideAccess: true,
    })
    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { roles: ['admin'] },
      user: { ...editor, collection: 'users' },
      overrideAccess: false,
    })
    expect(updated.roles).toEqual(['editor'])
  })
})
