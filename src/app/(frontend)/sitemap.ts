import type { MetadataRoute } from 'next'

import { getSitemapEntries } from '@/lib/queries'
import { absoluteUrl, categoryPath, pagePath, productPath } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, products, categories } = await getSitemapEntries()
  return [
    ...pages.map((page) => ({
      url: absoluteUrl(pagePath(page)),
      lastModified: page.updatedAt,
      priority: page.slug === 'home' ? 1 : 0.6,
    })),
    { url: absoluteUrl('/shop'), changeFrequency: 'daily' as const, priority: 0.9 },
    ...categories.map((category) => ({
      url: absoluteUrl(categoryPath(category)),
      lastModified: category.updatedAt,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(productPath(product)),
      lastModified: product.updatedAt,
      priority: 0.7,
    })),
  ]
}
