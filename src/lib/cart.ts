import { MAX_CART_LINES, MAX_QTY_PER_LINE } from './constants'

export type CartItem = {
  productId: number
  variantId: string
  slug: string
  title: string
  size: string
  price: number
  image: string | null
  quantity: number
}

export type CartState = { items: CartItem[] }

export type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'setQuantity'; productId: number; variantId: string; quantity: number }
  | { type: 'remove'; productId: number; variantId: string }
  | { type: 'replace'; items: CartItem[] }
  | { type: 'clear' }

const clampQuantity = (quantity: number): number =>
  Math.min(MAX_QTY_PER_LINE, Math.max(1, Math.trunc(Number(quantity) || 1)))

const sameLine = (
  a: Pick<CartItem, 'productId' | 'variantId'>,
  b: Pick<CartItem, 'productId' | 'variantId'>,
) => a.productId === b.productId && a.variantId === b.variantId

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((item) => sameLine(item, action.item))
      if (existing) {
        return {
          items: state.items.map((item) =>
            sameLine(item, action.item)
              ? {
                  ...item,
                  ...action.item,
                  quantity: clampQuantity(item.quantity + action.item.quantity),
                }
              : item,
          ),
        }
      }
      if (state.items.length >= MAX_CART_LINES) return state
      return {
        items: [...state.items, { ...action.item, quantity: clampQuantity(action.item.quantity) }],
      }
    }
    case 'setQuantity':
      if (action.quantity <= 0) {
        return { items: state.items.filter((item) => !sameLine(item, action)) }
      }
      return {
        items: state.items.map((item) =>
          sameLine(item, action) ? { ...item, quantity: clampQuantity(action.quantity) } : item,
        ),
      }
    case 'remove':
      return { items: state.items.filter((item) => !sameLine(item, action)) }
    case 'replace':
      return { items: sanitizeCartItems(action.items) }
    case 'clear':
      return { items: [] }
    default:
      return state
  }
}

/** Validate data read back from localStorage, which may be stale or tampered with. */
export function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        Number.isInteger(item.productId) &&
        typeof item.variantId === 'string' &&
        typeof item.slug === 'string' &&
        typeof item.title === 'string' &&
        typeof item.size === 'string' &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price),
    )
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      slug: item.slug,
      title: item.title,
      size: item.size,
      price: item.price,
      image: typeof item.image === 'string' ? item.image : null,
      quantity: clampQuantity(item.quantity),
    }))
    .slice(0, MAX_CART_LINES)
}

export const cartCount = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0)

export const cartSubtotal = (items: CartItem[]): number =>
  Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
