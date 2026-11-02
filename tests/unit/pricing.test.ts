import { describe, expect, it } from 'vitest'

import {
  calculateShipping,
  issueMessage,
  normalizeLines,
  priceCart,
  type PricingProduct,
} from '@/lib/pricing'

const product = (overrides: Partial<PricingProduct> = {}): PricingProduct => ({
  id: 1,
  title: 'Bodysuit',
  slug: 'bodysuit',
  price: 22,
  status: 'active',
  image: '/img.webp',
  variants: [
    { id: 'v-small', size: '0-3m', sku: 'BODY-03', stock: 5 },
    { id: 'v-big', size: '3-6m', sku: 'BODY-36', stock: 0 },
  ],
  ...overrides,
})

const shipping = { shippingRate: 5.95, freeShippingThreshold: 75 }

describe('calculateShipping', () => {
  it('charges the flat rate below the threshold', () => {
    expect(calculateShipping(50, shipping)).toBe(5.95)
  })
  it('is free at or above the threshold', () => {
    expect(calculateShipping(75, shipping)).toBe(0)
    expect(calculateShipping(120, shipping)).toBe(0)
  })
  it('is free for an empty cart', () => {
    expect(calculateShipping(0, shipping)).toBe(0)
  })
  it('always charges when there is no threshold', () => {
    expect(calculateShipping(500, { shippingRate: 4, freeShippingThreshold: null })).toBe(4)
  })
})

describe('normalizeLines', () => {
  it('merges duplicate variants and drops malformed lines', () => {
    const lines = normalizeLines([
      { productId: 1, variantId: 'a', quantity: 1 },
      { productId: 1, variantId: 'a', quantity: 2 },
      { productId: 1.5, variantId: 'a', quantity: 1 },
      // @ts-expect-error testing bad input
      { productId: 2, variantId: 3, quantity: 1 },
    ])
    expect(lines).toEqual([{ productId: 1, variantId: 'a', quantity: 3 }])
  })
})

describe('priceCart', () => {
  it('uses database prices, not client prices', () => {
    const cart = priceCart(
      [{ productId: 1, variantId: 'v-small', quantity: 2 }],
      [product({ price: 19.99 })],
      shipping,
    )
    expect(cart.lines[0]).toMatchObject({
      unitPrice: 19.99,
      lineTotal: 39.98,
      size: '0-3m',
      sku: 'BODY-03',
    })
    expect(cart.subtotal).toBe(39.98)
    expect(cart.shipping).toBe(5.95)
    expect(cart.total).toBe(45.93)
    expect(cart.itemCount).toBe(2)
    expect(cart.issues).toEqual([])
  })

  it('applies free shipping over the threshold', () => {
    const cart = priceCart(
      [{ productId: 1, variantId: 'v-small', quantity: 4 }],
      [product({ price: 20 })],
      shipping,
    )
    expect(cart.subtotal).toBe(80)
    expect(cart.shipping).toBe(0)
    expect(cart.total).toBe(80)
  })

  it('flags unknown, inactive and sold-out items', () => {
    const cart = priceCart(
      [
        { productId: 99, variantId: 'x', quantity: 1 },
        { productId: 2, variantId: 'v-small', quantity: 1 },
        { productId: 1, variantId: 'v-big', quantity: 1 },
        { productId: 1, variantId: 'missing', quantity: 1 },
      ],
      [product(), product({ id: 2, status: 'draft' })],
      shipping,
    )
    expect(cart.lines).toEqual([])
    expect(cart.issues.map((issue) => issue.type)).toEqual([
      'unavailable',
      'unavailable',
      'out_of_stock',
      'unavailable',
    ])
    expect(cart.total).toBe(0)
  })

  it('reports how many are left when stock is insufficient', () => {
    const cart = priceCart(
      [{ productId: 1, variantId: 'v-small', quantity: 7 }],
      [product()],
      shipping,
    )
    expect(cart.issues).toEqual([
      { productId: 1, variantId: 'v-small', type: 'insufficient_stock', available: 5 },
    ])
    expect(issueMessage(cart.issues[0]!)).toBe('Only 5 left in this size.')
  })

  it('rejects quantities above the per-line maximum', () => {
    const cart = priceCart(
      [{ productId: 1, variantId: 'v-small', quantity: 11 }],
      [product({ variants: [{ id: 'v-small', size: '0-3m', stock: 50 }] })],
      shipping,
    )
    expect(cart.issues[0]?.type).toBe('invalid_quantity')
  })

  it('avoids floating point drift', () => {
    const cart = priceCart(
      [{ productId: 1, variantId: 'v-small', quantity: 3 }],
      [product({ price: 0.1 })],
      {
        shippingRate: 0.2,
      },
    )
    expect(cart.subtotal).toBe(0.3)
    expect(cart.total).toBe(0.5)
  })
})
