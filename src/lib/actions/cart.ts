'use server'

import { createCheckout, cartLinesSchema, priceCartFromDatabase } from '@/lib/checkout'
import type { CartLineInput, PricedCart } from '@/lib/pricing'
import { getPayloadClient } from '@/lib/payload'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { isCheckoutEnabled } from '@/lib/stripe'

export type ValidateCartResult = { ok: true; cart: PricedCart } | { ok: false; message: string }

/** Re-price the visitor's cart with current prices and stock. */
export async function validateCart(lines: CartLineInput[]): Promise<ValidateCartResult> {
  const parsed = cartLinesSchema.safeParse(lines)
  if (!parsed.success)
    return { ok: false, message: 'Your bag could not be read. Please refresh the page.' }

  const limited = rateLimit(`cart:${await clientIp()}`, 60, 60 * 1000)
  if (!limited.ok) return { ok: false, message: 'Too many requests. Please wait a moment.' }

  const payload = await getPayloadClient()
  return { ok: true, cart: await priceCartFromDatabase(payload, parsed.data) }
}

export type StartCheckoutResult =
  { ok: true; url: string } | { ok: false; message: string; cart?: PricedCart }

export async function startCheckout(lines: CartLineInput[]): Promise<StartCheckoutResult> {
  if (!isCheckoutEnabled()) {
    return {
      ok: false,
      message: 'Online checkout is not available yet. Please contact us to order.',
    }
  }
  const parsed = cartLinesSchema.safeParse(lines)
  if (!parsed.success)
    return { ok: false, message: 'Your bag could not be read. Please refresh the page.' }

  const limited = rateLimit(`checkout:${await clientIp()}`, 10, 60 * 1000)
  if (!limited.ok)
    return { ok: false, message: 'Too many checkout attempts. Please wait a minute and try again.' }

  const payload = await getPayloadClient()
  const result = await createCheckout(payload, parsed.data)
  if (result.ok) return { ok: true, url: result.url }
  if (result.reason === 'issues') {
    return {
      ok: false,
      message: 'Some items in your bag have changed. Please review them before checking out.',
      cart: result.cart,
    }
  }
  return { ok: false, message: result.message }
}
