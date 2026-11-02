import type { Metadata } from 'next'

import {
  type ListingSearchParams,
  parseListingParams,
  ProductListing,
} from '@/components/shop/ProductListing'

type Props = { searchParams: Promise<ListingSearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, size, sort, page } = parseListingParams(await searchParams)
  const filtered = Boolean(q || size || sort !== 'featured' || page > 1)
  return {
    title: q ? `Search: ${q}` : 'Shop all baby clothes',
    description:
      'Browse soft, organic baby clothing — bodysuits, sleepsuits, knitwear and accessories.',
    alternates: { canonical: '/shop' },
    robots: filtered ? { index: false, follow: true } : undefined,
  }
}

export default async function ShopPage({ searchParams }: Props) {
  return <ProductListing searchParams={await searchParams} />
}
