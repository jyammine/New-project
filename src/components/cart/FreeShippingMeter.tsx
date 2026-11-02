'use client'

import { useCart } from './CartProvider'

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const { config, format } = useCart()
  const threshold = config.freeShippingThreshold
  if (!threshold || threshold <= 0 || subtotal <= 0) return null
  const remaining = Math.max(0, threshold - subtotal)
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100))

  return (
    <div className="rounded-2xl bg-sage/60 p-4">
      <p className="text-sm font-semibold text-sage-strong">
        {remaining > 0 ? (
          <>You&apos;re {format(remaining)} away from free shipping</>
        ) : (
          <>Your order ships for free 🎉</>
        )}
      </p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progress towards free shipping"
      >
        <div
          className="h-full rounded-full bg-sage-strong transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
