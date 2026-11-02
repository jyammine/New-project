import 'server-only'

import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import type { Where } from 'payload'
import { cache } from 'react'

import type { Category, Product } from '@/payload-types'

import { getPayloadClient } from './payload'
import { CACHE_TAGS } from './revalidate'

/**
 * CMS changes invalidate cached data immediately through Payload hooks. This is a safety net
 * for changes made outside the app (e.g. the seed script or direct database edits).
 */
const REVALIDATE_SECONDS = 10 * 60

export const isDraftMode = cache(async (): Promise<boolean> => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
})

// ─── Globals ────────────────────────────────────────────────────────────────

export const getSettings = cache(
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'settings', depth: 1 })
    },
    ['global', 'settings'],
    { tags: [CACHE_TAGS.global('settings')], revalidate: REVALIDATE_SECONDS },
  ),
)

export const getHeader = cache(
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'header', depth: 1 })
    },
    ['global', 'header'],
    { tags: [CACHE_TAGS.global('header')], revalidate: REVALIDATE_SECONDS },
  ),
)

export const getFooter = cache(
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'footer', depth: 1 })
    },
    ['global', 'footer'],
    { tags: [CACHE_TAGS.global('footer')], revalidate: REVALIDATE_SECONDS },
  ),
)

// ─── Pages ──────────────────────────────────────────────────────────────────

const fetchPage = async (slug: string, draft: boolean) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft,
    overrideAccess: draft,
    pagination: false,
  })
  return result.docs[0] ?? null
}

export const getPage = cache(async (slug: string) => {
  if (await isDraftMode()) return fetchPage(slug, true)
  return unstable_cache(() => fetchPage(slug, false), ['page', slug], {
    tags: [CACHE_TAGS.pages, CACHE_TAGS.page(slug)],
    revalidate: REVALIDATE_SECONDS,
  })()
})

// ─── Categories ─────────────────────────────────────────────────────────────

export const getCategories = cache(
  unstable_cache(
    async (): Promise<Category[]> => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'categories',
        depth: 1,
        limit: 100,
        sort: 'sortOrder',
        pagination: false,
      })
      return result.docs
    },
    ['categories'],
    { tags: [CACHE_TAGS.categories], revalidate: REVALIDATE_SECONDS },
  ),
)

export const getCategory = cache(async (slug: string) => {
  const categories = await getCategories()
  return categories.find((category) => category.slug === slug) ?? null
})

// ─── Products ───────────────────────────────────────────────────────────────

export const PRODUCT_SORTS = {
  featured: { label: 'Featured', sort: ['-featured', '-createdAt'] },
  newest: { label: 'Newest', sort: '-createdAt' },
  'price-asc': { label: 'Price: low to high', sort: 'price' },
  'price-desc': { label: 'Price: high to low', sort: '-price' },
} as const

export type ProductSort = keyof typeof PRODUCT_SORTS

export const isProductSort = (value: unknown): value is ProductSort =>
  typeof value === 'string' && value in PRODUCT_SORTS

const cardSelect = {
  title: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  images: true,
  badge: true,
  color: true,
  variants: true,
  status: true,
} as const

export type ProductCardData = Pick<
  Product,
  | 'id'
  | 'title'
  | 'slug'
  | 'price'
  | 'compareAtPrice'
  | 'images'
  | 'badge'
  | 'color'
  | 'variants'
  | 'status'
>

export type ProductListArgs = {
  categoryId?: number
  size?: string
  query?: string
  sort?: ProductSort
  page?: number
  limit?: number
}

const fetchProducts = async (args: ProductListArgs, draft: boolean) => {
  const payload = await getPayloadClient()
  const where: Where[] = []
  if (!draft) where.push({ status: { equals: 'active' } })
  if (args.categoryId) where.push({ categories: { in: [args.categoryId] } })
  if (args.size) where.push({ 'variants.size': { equals: args.size } })
  if (args.query) {
    where.push({
      or: [
        { title: { like: args.query } },
        { shortDescription: { like: args.query } },
        { color: { like: args.query } },
      ],
    })
  }

  const sort = PRODUCT_SORTS[args.sort ?? 'featured'].sort
  const result = await payload.find({
    collection: 'products',
    where: where.length ? { and: where } : undefined,
    sort: sort as string | string[],
    page: Math.max(1, args.page ?? 1),
    limit: args.limit ?? 12,
    depth: 1,
    overrideAccess: draft,
    select: cardSelect,
  })

  return {
    ...result,
    docs: result.docs as unknown as ProductCardData[],
  }
}

export const listProducts = cache(async (args: ProductListArgs) => {
  if (await isDraftMode()) return fetchProducts(args, true)
  return unstable_cache(() => fetchProducts(args, false), ['products', JSON.stringify(args)], {
    tags: [CACHE_TAGS.products],
    revalidate: REVALIDATE_SECONDS,
  })()
})

const fetchFeatured = async (
  source: 'featured' | 'newest' | 'category',
  limit: number,
  categoryId?: number,
): Promise<ProductCardData[]> => {
  const payload = await getPayloadClient()
  const where: Where[] = [{ status: { equals: 'active' } }]
  if (source === 'featured') where.push({ featured: { equals: true } })
  if (source === 'category' && categoryId) where.push({ categories: { in: [categoryId] } })
  const result = await payload.find({
    collection: 'products',
    where: { and: where },
    sort: '-createdAt',
    limit,
    depth: 1,
    select: cardSelect,
  })
  return result.docs as unknown as ProductCardData[]
}

export const getProductsForBlock = cache(
  async (source: 'featured' | 'newest' | 'category', limit: number, categoryId?: number) =>
    unstable_cache(
      () => fetchFeatured(source, limit, categoryId),
      ['products-block', source, String(limit), String(categoryId ?? '')],
      { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
    )(),
)

const fetchProduct = async (slug: string, draft: boolean) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: draft
      ? { slug: { equals: slug } }
      : { and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }] },
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
  })
  return result.docs[0] ?? null
}

export const getProduct = cache(async (slug: string) => {
  if (await isDraftMode()) return fetchProduct(slug, true)
  return unstable_cache(() => fetchProduct(slug, false), ['product', slug], {
    tags: [CACHE_TAGS.products, CACHE_TAGS.product(slug)],
    revalidate: REVALIDATE_SECONDS,
  })()
})

export const getRelatedProducts = cache(
  async (product: Product, limit = 4): Promise<ProductCardData[]> => {
    const picked = (product.relatedProducts ?? []).filter(
      (item): item is Product => typeof item === 'object' && item?.status === 'active',
    )
    if (picked.length >= limit) return picked.slice(0, limit)

    const categoryIds = (product.categories ?? []).map((c) => (typeof c === 'object' ? c.id : c))
    if (!categoryIds.length) return picked

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'active' } },
          { categories: { in: categoryIds } },
          { id: { not_in: [product.id, ...picked.map((p) => p.id)] } },
        ],
      },
      limit: limit - picked.length,
      depth: 1,
      select: cardSelect,
    })
    return [...(picked as ProductCardData[]), ...(result.docs as unknown as ProductCardData[])]
  },
)

// ─── Sitemap ────────────────────────────────────────────────────────────────

export const getSitemapEntries = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const [pages, products, categories] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { _status: { equals: 'published' } },
        select: { slug: true, updatedAt: true },
        pagination: false,
        limit: 1000,
      }),
      payload.find({
        collection: 'products',
        where: { status: { equals: 'active' } },
        select: { slug: true, updatedAt: true },
        pagination: false,
        limit: 5000,
      }),
      payload.find({
        collection: 'categories',
        select: { slug: true, updatedAt: true },
        pagination: false,
        limit: 500,
      }),
    ])
    return { pages: pages.docs, products: products.docs, categories: categories.docs }
  },
  ['sitemap'],
  { tags: [CACHE_TAGS.sitemap], revalidate: REVALIDATE_SECONDS },
)
