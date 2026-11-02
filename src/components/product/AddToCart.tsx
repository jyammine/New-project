'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useCart } from '@/components/cart/CartProvider'
import { QuantityStepper } from '@/components/cart/QuantityStepper'
import { cn } from '@/components/ui/cn'
import { MAX_QTY_PER_LINE, sizeLabel } from '@/lib/constants'

export type AddToCartProduct = {
  id: number
  slug: string
  title: string
  price: number
  image: string | null
  variants: Array<{ id: string; size: string; stock: number }>
}

export function AddToCart({
  product,
  lowStockThreshold,
}: {
  product: AddToCartProduct
  lowStockThreshold: number
}) {
  const { addItem, items } = useCart()
  const firstAvailable = product.variants.find((variant) => variant.stock > 0)
  const [selectedId, setSelectedId] = useState<string | null>(
    product.variants.length === 1 ? (firstAvailable?.id ?? null) : null,
  )
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const selected = product.variants.find((variant) => variant.id === selectedId) ?? null
  const inCart = selected
    ? (items.find((item) => item.productId === product.id && item.variantId === selected.id)
        ?.quantity ?? 0)
    : 0
  const maxForSelection = selected
    ? Math.max(0, Math.min(selected.stock, MAX_QTY_PER_LINE) - inCart)
    : MAX_QTY_PER_LINE
  const soldOut = !firstAvailable

  const onAdd = () => {
    if (!selected) {
      setError('Please choose a size.')
      return
    }
    if (maxForSelection < 1) {
      setError(
        inCart > 0
          ? 'You already have all available pieces in your bag.'
          : 'This size is sold out.',
      )
      return
    }
    addItem({
      productId: product.id,
      variantId: selected.id,
      slug: product.slug,
      title: product.title,
      size: selected.size,
      price: product.price,
      image: product.image,
      quantity: Math.min(quantity, maxForSelection),
    })
    setQuantity(1)
    setError(null)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 flex w-full items-center justify-between text-sm font-extrabold">
          <span>
            Size
            {selected && (
              <span className="font-semibold text-ink-soft">: {sizeLabel(selected.size)}</span>
            )}
          </span>
          <Link
            href="/size-guide"
            className="font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Size guide
          </Link>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant) => {
            const out = variant.stock <= 0
            const isSelected = variant.id === selectedId
            return (
              <label
                key={variant.id}
                className={cn(
                  'relative flex min-h-11 min-w-20 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-bold transition-colors',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage-strong',
                  isSelected
                    ? 'border-ink bg-ink text-cream'
                    : 'border-line bg-white hover:border-ink/50',
                  out && 'cursor-not-allowed text-ink-soft/60 line-through hover:border-line',
                )}
              >
                <input
                  type="radio"
                  name="size"
                  value={variant.id}
                  checked={isSelected}
                  disabled={out}
                  onChange={() => {
                    setSelectedId(variant.id)
                    setQuantity(1)
                    setError(null)
                  }}
                  className="sr-only"
                />
                {sizeLabel(variant.size)}
                {out && <span className="sr-only"> (sold out)</span>}
              </label>
            )
          })}
        </div>
        {selected && selected.stock > 0 && selected.stock <= lowStockThreshold && (
          <p className="mt-3 text-sm font-bold text-sale">
            Only {selected.stock} left in this size
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, maxForSelection)}
          label="Quantity"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut}
          className="btn btn-primary min-h-12 flex-1 text-base"
        >
          {soldOut ? (
            'Sold out'
          ) : added ? (
            <>
              <Check className="size-5" aria-hidden /> Added to bag
            </>
          ) : (
            'Add to bag'
          )}
        </button>
      </div>
      <p role="alert" className={cn('text-sm font-bold text-sale', !error && 'sr-only')}>
        {error}
      </p>
    </div>
  )
}
