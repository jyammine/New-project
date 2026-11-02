'use client'

import { LoaderCircle, Lock, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'

import { startCheckout, validateCart } from '@/lib/actions/cart'
import type { CartItem } from '@/lib/cart'
import { sizeLabel } from '@/lib/constants'
import { type CartIssue, issueMessage, type PricedCart } from '@/lib/pricing'

import { useCart } from './CartProvider'
import { FreeShippingMeter } from './FreeShippingMeter'
import { QuantityStepper } from './QuantityStepper'

const lineKey = (item: { productId: number; variantId: string }) =>
  `${item.productId}:${item.variantId}`

/** Bring locally stored items in line with the server's prices and availability. */
function reconcile(items: CartItem[], cart: PricedCart): CartItem[] {
  const priced = new Map(cart.lines.map((line) => [lineKey(line), line]))
  return items.flatMap((item) => {
    const line = priced.get(lineKey(item))
    if (line)
      return [
        { ...item, price: line.unitPrice, title: line.title, image: line.image ?? item.image },
      ]
    const issue = cart.issues.find((i) => lineKey(i) === lineKey(item))
    if (issue?.type === 'insufficient_stock' && issue.available) {
      return [{ ...item, quantity: issue.available }]
    }
    // Unavailable or sold out items stay visible (flagged) so the customer knows what happened.
    return [item]
  })
}

export function CartView({ cancelled }: { cancelled: boolean }) {
  const { items, hydrated, setQuantity, removeItem, replaceItems, format, config } = useCart()
  const [issues, setIssues] = useState<CartIssue[]>([])
  const [message, setMessage] = useState<string | null>(
    cancelled ? 'Checkout was cancelled — your bag is saved.' : null,
  )
  const [checkingOut, startTransition] = useTransition()
  const [validated, setValidated] = useState(false)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const signature = items.map((i) => `${lineKey(i)}x${i.quantity}`).join('|')

  useEffect(() => {
    if (!hydrated) return
    const current = itemsRef.current
    if (!current.length) {
      setIssues([])
      setValidated(true)
      return
    }
    let cancelledRequest = false
    validateCart(
      current.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
    )
      .then((result) => {
        if (cancelledRequest) return
        if (!result.ok) {
          setMessage(result.message)
          return
        }
        setIssues(result.cart.issues)
        const next = reconcile(itemsRef.current, result.cart)
        const changed = JSON.stringify(next) !== JSON.stringify(itemsRef.current)
        if (changed) replaceItems(next)
        setValidated(true)
      })
      .catch(
        () =>
          !cancelledRequest && setMessage('We could not check your bag. Please refresh the page.'),
      )
    return () => {
      cancelledRequest = true
    }
  }, [hydrated, signature, replaceItems])

  const issueFor = (item: CartItem) => issues.find((issue) => lineKey(issue) === lineKey(item))
  const blockingIssues = items.filter((item) => {
    const issue = issueFor(item)
    return issue && issue.type !== 'insufficient_stock'
  })
  const purchasable = items.filter(
    (item) => !issueFor(item) || issueFor(item)?.type === 'insufficient_stock',
  )
  const subtotal =
    Math.round(purchasable.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100
  const freeShipping =
    config.freeShippingThreshold !== null &&
    config.freeShippingThreshold > 0 &&
    subtotal >= config.freeShippingThreshold
  const shipping = subtotal > 0 && !freeShipping ? config.shippingRate : 0

  const onCheckout = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await startCheckout(
        purchasable.map(({ productId, variantId, quantity }) => ({
          productId,
          variantId,
          quantity,
        })),
      )
      if (result.ok) {
        window.location.assign(result.url)
        return
      }
      setMessage(result.message)
      if (result.cart) {
        setIssues(result.cart.issues)
        replaceItems(reconcile(itemsRef.current, result.cart))
      }
    })
  }

  if (!hydrated) {
    return (
      <div className="flex justify-center py-24" aria-busy="true">
        <LoaderCircle className="size-8 animate-spin text-ink-soft" aria-label="Loading your bag" />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-sand px-6 py-20 text-center">
        <ShoppingBag className="size-10 text-ink-soft" aria-hidden />
        <h2 className="text-2xl">Your bag is empty</h2>
        <p className="text-ink-soft">Find something soft and lovely for your little one.</p>
        {message && <p className="text-sm font-semibold">{message}</p>}
        <Link href="/shop" className="btn btn-primary mt-2">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <section className="lg:col-span-7" aria-label="Items in your bag">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => {
            const issue = issueFor(item)
            return (
              <li key={lineKey(item)} className="flex gap-4 py-6 sm:gap-6">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-sand sm:size-32"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-lg font-bold hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-ink-soft">{sizeLabel(item.size)}</p>
                    </div>
                    <p className="font-bold tabular-nums">{format(item.price * item.quantity)}</p>
                  </div>
                  {issue && (
                    <p className="text-sm font-bold text-sale" role="status">
                      {issueMessage(issue)}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <QuantityStepper
                      value={item.quantity}
                      max={issue?.available ?? undefined}
                      onChange={(qty) => setQuantity(item.productId, item.variantId, qty)}
                      label={`Quantity of ${item.title}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
                    >
                      <X className="size-4" aria-hidden /> Remove
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <Link href="/shop" className="btn btn-link mt-6">
          Continue shopping
        </Link>
      </section>

      <aside className="lg:col-span-5" aria-labelledby="summary-heading">
        <div className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:sticky lg:top-28">
          <h2 id="summary-heading" className="text-2xl">
            Order summary
          </h2>
          <div className="mt-5">
            <FreeShippingMeter subtotal={subtotal} />
          </div>
          <dl className="mt-6 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-bold tabular-nums">{format(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Shipping</dt>
              <dd className="font-bold tabular-nums">
                {shipping === 0 ? 'Free' : format(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-extrabold">Estimated total</dt>
              <dd className="font-extrabold tabular-nums">{format(subtotal + shipping)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink-soft">Taxes and discounts are applied at checkout.</p>

          {message && (
            <p className="mt-5 rounded-2xl bg-butter px-4 py-3 text-sm font-semibold" role="alert">
              {message}
            </p>
          )}
          {blockingIssues.length > 0 && (
            <p className="mt-5 text-sm font-semibold text-sale">
              Unavailable items will be left out of your order.
            </p>
          )}

          {config.checkoutEnabled ? (
            <button
              type="button"
              className="btn btn-primary mt-6 min-h-12 w-full text-base"
              onClick={onCheckout}
              disabled={checkingOut || !validated || purchasable.length === 0}
            >
              {checkingOut ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden /> Redirecting to
                  payment…
                </>
              ) : (
                <>
                  <Lock className="size-4" aria-hidden /> Check out securely
                </>
              )}
            </button>
          ) : (
            <p className="mt-6 rounded-2xl bg-sand px-4 py-3 text-sm">
              Online checkout is coming soon. Please{' '}
              <Link href="/contact" className="font-bold underline">
                contact us
              </Link>{' '}
              to place an order.
            </p>
          )}
          <p className="mt-4 text-center text-xs text-ink-soft">
            Payments are processed securely by Stripe. We never see your card details.
          </p>
        </div>
      </aside>
    </div>
  )
}
