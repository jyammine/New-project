'use client'

import { ShoppingBag } from 'lucide-react'

import { useCart } from './CartProvider'

export function CartButton() {
  const { count, open, hydrated } = useCart()
  const label =
    hydrated && count > 0 ? `Open bag, ${count} item${count === 1 ? '' : 's'}` : 'Open bag'
  return (
    <button
      type="button"
      onClick={open}
      className="relative flex size-11 items-center justify-center rounded-full hover:bg-sand"
      aria-label={label}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {hydrated && count > 0 && (
        <span className="absolute top-1 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] leading-5 font-extrabold text-cream">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
