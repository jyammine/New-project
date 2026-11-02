import { revalidateTag } from 'next/cache'
import type { PayloadRequest } from 'payload'

export const CACHE_TAGS = {
  products: 'products',
  product: (slug: string) => `product:${slug}`,
  categories: 'categories',
  pages: 'pages',
  page: (slug: string) => `page:${slug}`,
  global: (slug: string) => `global:${slug}`,
  sitemap: 'sitemap',
} as const

/** Every cached entry carries at least one of these tags, so revalidating them clears everything. */
export const ALL_CACHE_TAGS: string[] = [
  CACHE_TAGS.products,
  CACHE_TAGS.categories,
  CACHE_TAGS.pages,
  CACHE_TAGS.sitemap,
  CACHE_TAGS.global('settings'),
  CACHE_TAGS.global('header'),
  CACHE_TAGS.global('footer'),
]

/**
 * Invalidate cached data for the given tags.
 *
 * Payload hooks also run outside of Next.js (seed scripts, migrations, CLI), where
 * `revalidateTag` is not available, so failures are swallowed and logged at debug level.
 */
export function revalidateTags(tags: string[], req?: PayloadRequest): void {
  if (req?.context?.disableRevalidate) return
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (error) {
      req?.payload.logger.debug({ msg: `Skipped revalidation for tag "${tag}"`, err: error })
    }
  }
}
