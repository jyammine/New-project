import Link from 'next/link'

import { CmsImage } from '@/components/CmsImage'
import { Price } from '@/components/Price'
import { firstMedia } from '@/lib/media'
import type { ProductCardData } from '@/lib/queries'
import { productPath } from '@/lib/urls'

const BADGES: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-sky text-sky-strong' },
  bestseller: { label: 'Bestseller', className: 'bg-butter text-butter-strong' },
  limited: { label: 'Limited', className: 'bg-blush text-ink' },
  organic: { label: 'Organic', className: 'bg-sage text-sage-strong' },
}

type Props = {
  product: ProductCardData
  currency: string
  locale: string
  priority?: boolean
}

export function ProductCard({ product, currency, locale, priority }: Props) {
  const images = (product.images ?? []).filter((img) => typeof img === 'object')
  const image = firstMedia(images)
  const hoverImage = images[1] && typeof images[1] === 'object' ? images[1] : null
  const inStock = (product.variants ?? []).some((variant) => (variant.stock ?? 0) > 0)
  const onSale =
    typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
  const badge = !inStock
    ? { label: 'Sold out', className: 'bg-ink text-cream' }
    : onSale
      ? { label: 'Sale', className: 'bg-sale text-white' }
      : product.badge
        ? BADGES[product.badge]
        : null

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-sand">
        {image && (
          <CmsImage
            media={image}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            priority={priority}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
        {hoverImage && (
          <CmsImage
            media={hoverImage}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {badge && (
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1 px-1">
        <h3 className="font-sans text-base leading-snug font-bold tracking-normal">
          <Link
            href={productPath(product)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>
        {product.color && <p className="text-sm text-ink-soft">{product.color}</p>}
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          currency={currency}
          locale={locale}
          className="mt-auto pt-1"
        />
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  currency,
  locale,
  prioritizeFirst = false,
}: {
  products: ProductCardData[]
  currency: string
  locale: string
  prioritizeFirst?: boolean
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            currency={currency}
            locale={locale}
            priority={prioritizeFirst && index < 4}
          />
        </li>
      ))}
    </ul>
  )
}
