import type Stripe from 'stripe'

import { abandonCheckoutSession, fulfillCheckoutSession, markRefunded } from '@/lib/orders'
import { getPayloadClient } from '@/lib/payload'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) return Response.json({ error: 'Missing signature' }, { status: 400 })

  const body = await request.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillCheckoutSession(payload, event.data.object)
        // Refresh stock on product pages, even if the order-confirmation page processed it first.
        revalidateTags([CACHE_TAGS.products])
        break
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        await abandonCheckoutSession(payload, event.data.object)
        break
      case 'charge.refunded': {
        const charge = event.data.object
        const paymentIntent =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id
        if (paymentIntent && charge.refunded) await markRefunded(payload, paymentIntent)
        break
      }
      default:
        break
    }
  } catch (err) {
    payload.logger.error({ err, msg: `Failed to handle Stripe event ${event.id} (${event.type})` })
    // A 500 makes Stripe retry the event later.
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}
