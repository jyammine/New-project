import { describe, expect, it } from 'vitest'

import { type CartItem, cartCount, cartReducer, cartSubtotal, sanitizeCartItems } from '@/lib/cart'
import { MAX_QTY_PER_LINE } from '@/lib/constants'

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  variantId: 'v1',
  slug: 'bodysuit',
  title: 'Bodysuit',
  size: '0-3m',
  price: 22,
  image: null,
  quantity: 1,
  ...overrides,
})

describe('cartReducer', () => {
  it('adds new lines and merges existing ones', () => {
    let state = cartReducer({ items: [] }, { type: 'add', item: item() })
    state = cartReducer(state, { type: 'add', item: item({ quantity: 2 }) })
    state = cartReducer(state, { type: 'add', item: item({ variantId: 'v2' }) })
    expect(state.items).toHaveLength(2)
    expect(state.items[0]?.quantity).toBe(3)
  })

  it('caps quantities', () => {
    const state = cartReducer(
      { items: [item({ quantity: 9 })] },
      { type: 'add', item: item({ quantity: 5 }) },
    )
    expect(state.items[0]?.quantity).toBe(MAX_QTY_PER_LINE)
  })

  it('removes a line when quantity drops to zero', () => {
    const state = cartReducer(
      { items: [item()] },
      { type: 'setQuantity', productId: 1, variantId: 'v1', quantity: 0 },
    )
    expect(state.items).toEqual([])
  })

  it('removes and clears', () => {
    const start = { items: [item(), item({ variantId: 'v2' })] }
    expect(
      cartReducer(start, { type: 'remove', productId: 1, variantId: 'v1' }).items,
    ).toHaveLength(1)
    expect(cartReducer(start, { type: 'clear' }).items).toEqual([])
  })

  it('computes count and subtotal', () => {
    const items = [item({ quantity: 2, price: 10.1 }), item({ variantId: 'v2', price: 5.05 })]
    expect(cartCount(items)).toBe(3)
    expect(cartSubtotal(items)).toBe(25.25)
  })
})

describe('sanitizeCartItems', () => {
  it('drops invalid entries from storage', () => {
    const result = sanitizeCartItems([
      item(),
      { productId: 'x' },
      null,
      item({ price: Number.NaN }),
      { ...item({ variantId: 'v3' }), quantity: 500, image: 42 },
    ])
    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({ variantId: 'v3', quantity: MAX_QTY_PER_LINE, image: null })
  })

  it('returns an empty cart for non-arrays', () => {
    expect(sanitizeCartItems({ items: [] })).toEqual([])
    expect(sanitizeCartItems('nope')).toEqual([])
  })
})
