import 'server-only'

import Stripe from 'stripe'

let client: Stripe | null = null

export const isCheckoutEnabled = (): boolean => Boolean(process.env.STRIPE_SECRET_KEY)

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  if (!client) {
    client = new Stripe(key, {
      maxNetworkRetries: 2,
      appInfo: { name: 'little-nest-shop' },
    })
  }
  return client
}
