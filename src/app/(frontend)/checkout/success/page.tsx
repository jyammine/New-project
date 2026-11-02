import { CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ClearCart } from '@/components/cart/ClearCart'
import { sizeLabel } from '@/lib/constants'
import { formatMoney } from '@/lib/money'
import { fulfillCheckoutSession } from '@/lib/orders'
import { getPayloadClient } from '@/lib/payload'
import { getSettings } from '@/lib/queries'
import { getStripe, isCheckoutEnabled } from '@/lib/stripe'
import type { Order } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Thank you for your order',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ session_id?: string }> }

async function loadOrder(sessionId: string): Promise<Order | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'orders',
    where: { stripeCheckoutSessionId: { equals: sessionId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  let order = result.docs[0] ?? null

  // If the webhook hasn't arrived yet, confirm the payment directly with Stripe.
  if (order?.status === 'pending' && isCheckoutEnabled()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const fulfilled = await fulfillCheckoutSession(payload, session)
      if (fulfilled.order) order = fulfilled.order
    } catch (err) {
      payload.logger.warn({ err, msg: `Could not confirm Stripe session ${sessionId}` })
    }
  }
  return order
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams
  const valid = typeof sessionId === 'string' && /^cs_[A-Za-z0-9_]+$/.test(sessionId)
  const [order, settings] = await Promise.all([valid ? loadOrder(sessionId) : null, getSettings()])
  const locale = settings?.locale ?? 'en-US'

  if (!order) {
    return (
      <div className="container-page max-w-2xl py-20 text-center">
        <h1 className="text-4xl">We couldn&apos;t find that order</h1>
        <p className="mt-4 text-ink-soft">
          If you completed a payment, you&apos;ll receive a confirmation email shortly. Questions?
          Get in touch and we&apos;ll help right away.
        </p>
        <Link href="/contact" className="btn btn-primary mt-8">
          Contact us
        </Link>
      </div>
    )
  }

  const paid = order.status !== 'pending'
  const money = (value: number | null | undefined) =>
    formatMoney(value ?? 0, order.currency, locale)

  return (
    <div className="container-page max-w-2xl py-14 sm:py-20">
      {paid && <ClearCart />}
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-sage-strong" aria-hidden />
        <h1 className="mt-4 text-4xl sm:text-5xl">{paid ? 'Thank you!' : 'Almost there…'}</h1>
        <p className="mt-4 text-lg text-ink-soft">
          {paid ? (
            <>
              Your order <strong className="text-ink">{order.orderNumber}</strong> is confirmed.
              {order.email && (
                <>
                  {' '}
                  A confirmation is on its way to{' '}
                  <strong className="text-ink">{order.email}</strong>.
                </>
              )}
            </>
          ) : (
            <>
              We&apos;re waiting for your payment to be confirmed. This page will update once it is.
            </>
          )}
        </p>
      </div>

      <section
        className="mt-10 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"
        aria-label="Order summary"
      >
        <h2 className="text-xl">Order {order.orderNumber}</h2>
        <ul className="mt-4 divide-y divide-line">
          {(order.items ?? []).map((item) => (
            <li key={item.id ?? item.variantId} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                <span className="font-bold">{item.title}</span>
                {item.size && <span className="text-ink-soft"> · {sizeLabel(item.size)}</span>}
                <span className="text-ink-soft"> × {item.quantity}</span>
              </span>
              <span className="font-bold tabular-nums">
                {money(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="tabular-nums">{money(order.subtotal)}</dd>
          </div>
          {order.discountTotal ? (
            <div className="flex justify-between">
              <dt className="text-ink-soft">Discount</dt>
              <dd className="tabular-nums">−{money(order.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink-soft">Shipping</dt>
            <dd className="tabular-nums">
              {order.shippingTotal ? money(order.shippingTotal) : 'Free'}
            </dd>
          </div>
          {order.taxTotal ? (
            <div className="flex justify-between">
              <dt className="text-ink-soft">Tax</dt>
              <dd className="tabular-nums">{money(order.taxTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-extrabold">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(order.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-10 text-center">
        <Link href="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
      {!paid && <meta httpEquiv="refresh" content="5" />}
    </div>
  )
}
