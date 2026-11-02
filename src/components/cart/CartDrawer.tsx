'use client'

import { ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { sizeLabel } from '@/lib/constants'

import { useCart } from './CartProvider'
import { FreeShippingMeter } from './FreeShippingMeter'
import { QuantityStepper } from './QuantityStepper'

export function CartDrawer() {
  const { items, isOpen, close, subtotal, setQuantity, removeItem, format, count } = useCart()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={close} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="animate-slide-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="cart-drawer-title" className="text-xl">
            Your bag {count > 0 && <span className="text-ink-soft">({count})</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="flex size-10 items-center justify-center rounded-full hover:bg-sand"
            aria-label="Close bag"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-ink-soft" aria-hidden />
            <p className="text-ink-soft">Your bag is empty.</p>
            <Link href="/shop" className="btn btn-primary" onClick={close}>
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FreeShippingMeter subtotal={subtotal} />
              <ul className="mt-4 divide-y divide-line">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="flex gap-4 py-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-sand">
                      {item.image && (
                        <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-bold hover:underline"
                          onClick={close}
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="-mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-sand hover:text-ink"
                          aria-label={`Remove ${item.title} from bag`}
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </div>
                      <p className="text-sm text-ink-soft">{sizeLabel(item.size)}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          onChange={(qty) => setQuantity(item.productId, item.variantId, qty)}
                          label={`Quantity of ${item.title}`}
                        />
                        <span className="font-bold tabular-nums">
                          {format(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-line bg-white px-6 py-5">
              <div className="flex justify-between text-base font-bold">
                <span>Subtotal</span>
                <span className="tabular-nums">{format(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                Shipping and taxes are calculated at checkout.
              </p>
              <Link href="/cart" className="btn btn-primary mt-4 w-full" onClick={close}>
                View bag &amp; check out
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
