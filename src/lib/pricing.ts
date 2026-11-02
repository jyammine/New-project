import { MAX_CART_LINES, MAX_QTY_PER_LINE } from './constants'
import { roundMoney } from './money'

export type CartLineInput = {
  productId: number
  variantId: string
  quantity: number
}

export type PricingVariant = {
  id?: string | null
  size: string
  sku?: string | null
  stock: number
}

export type PricingProduct = {
  id: number
  title: string
  slug: string
  price: number
  status: string
  image?: string | null
  variants: PricingVariant[]
}

export type CartIssueType =
  'unavailable' | 'out_of_stock' | 'insufficient_stock' | 'invalid_quantity'

export type CartIssue = {
  productId: number
  variantId: string
  type: CartIssueType
  /** Units currently available, when relevant. */
  available?: number
}

export type PricedLine = {
  productId: number
  variantId: string
  title: string
  slug: string
  size: string
  sku: string | null
  image: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
  available: number
}

export type ShippingSettings = {
  shippingRate: number
  freeShippingThreshold?: number | null
}

export type PricedCart = {
  lines: PricedLine[]
  issues: CartIssue[]
  subtotal: number
  shipping: number
  total: number
  itemCount: number
}

export function calculateShipping(subtotal: number, settings: ShippingSettings): number {
  if (subtotal <= 0) return 0
  const threshold = settings.freeShippingThreshold
  if (typeof threshold === 'number' && threshold > 0 && subtotal >= threshold) return 0
  return roundMoney(Math.max(0, settings.shippingRate || 0))
}

/** Combine duplicate lines for the same variant and drop malformed input. */
export function normalizeLines(lines: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, CartLineInput>()
  for (const line of lines) {
    if (!line || !Number.isInteger(line.productId) || typeof line.variantId !== 'string') continue
    const key = `${line.productId}:${line.variantId}`
    const existing = merged.get(key)
    const quantity = Math.trunc(Number(line.quantity) || 0)
    if (existing) existing.quantity += quantity
    else merged.set(key, { productId: line.productId, variantId: line.variantId, quantity })
  }
  return Array.from(merged.values()).slice(0, MAX_CART_LINES)
}

/**
 * Price a cart using authoritative product data from the database.
 * Never trust prices or stock sent by the browser.
 */
export function priceCart(
  input: CartLineInput[],
  products: PricingProduct[],
  shippingSettings: ShippingSettings,
): PricedCart {
  const byId = new Map(products.map((product) => [product.id, product]))
  const lines: PricedLine[] = []
  const issues: CartIssue[] = []

  for (const line of normalizeLines(input)) {
    const { productId, variantId } = line
    const product = byId.get(productId)
    const variant = product?.variants.find((v) => v.id === variantId)

    if (!product || product.status !== 'active' || !variant) {
      issues.push({ productId, variantId, type: 'unavailable' })
      continue
    }

    if (line.quantity < 1 || line.quantity > MAX_QTY_PER_LINE) {
      issues.push({ productId, variantId, type: 'invalid_quantity', available: variant.stock })
      continue
    }

    const available = Math.max(0, Math.trunc(variant.stock))
    if (available === 0) {
      issues.push({ productId, variantId, type: 'out_of_stock', available: 0 })
      continue
    }
    if (line.quantity > available) {
      issues.push({ productId, variantId, type: 'insufficient_stock', available })
      continue
    }

    const unitPrice = roundMoney(product.price)
    lines.push({
      productId,
      variantId,
      title: product.title,
      slug: product.slug,
      size: variant.size,
      sku: variant.sku ?? null,
      image: product.image ?? null,
      unitPrice,
      quantity: line.quantity,
      lineTotal: roundMoney(unitPrice * line.quantity),
      available,
    })
  }

  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0))
  const shipping = calculateShipping(subtotal, shippingSettings)
  return {
    lines,
    issues,
    subtotal,
    shipping,
    total: roundMoney(subtotal + shipping),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  }
}

export const issueMessage = (issue: CartIssue): string => {
  switch (issue.type) {
    case 'unavailable':
      return 'This item is no longer available.'
    case 'out_of_stock':
      return 'This size has just sold out.'
    case 'insufficient_stock':
      return `Only ${issue.available} left in this size.`
    case 'invalid_quantity':
      return `Please choose between 1 and ${MAX_QTY_PER_LINE}.`
  }
}
