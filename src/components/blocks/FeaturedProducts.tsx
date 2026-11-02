import { CmsLink } from '@/components/CmsLink'
import { ProductGrid } from '@/components/product/ProductCard'
import { getProductsForBlock, getSettings, type ProductCardData } from '@/lib/queries'
import type { FeaturedProductsBlock, Product } from '@/payload-types'

export async function FeaturedProducts({ block }: { block: FeaturedProductsBlock }) {
  const settings = await getSettings()
  const limit = block.limit ?? 4

  let products: ProductCardData[]
  if (block.source === 'manual') {
    products = (block.products ?? []).filter(
      (p): p is Product => typeof p === 'object' && p !== null && p.status === 'active',
    )
  } else {
    const categoryId =
      typeof block.category === 'object' ? block.category?.id : (block.category ?? undefined)
    products = await getProductsForBlock(block.source, limit, categoryId ?? undefined)
  }

  if (!products.length) return null

  return (
    <section className="container-page" aria-labelledby={`block-${block.id}`}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 id={`block-${block.id}`} className="text-3xl sm:text-4xl">
            {block.heading}
          </h2>
          {block.text && <p className="mt-3 text-lg text-ink-soft">{block.text}</p>}
        </div>
        {block.cta?.label && <CmsLink link={{ ...block.cta, appearance: 'secondary' }} asButton />}
      </div>
      <ProductGrid
        products={products}
        currency={settings?.currency ?? 'USD'}
        locale={settings?.locale ?? 'en-US'}
      />
    </section>
  )
}
