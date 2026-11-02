import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  type ListingSearchParams,
  parseListingParams,
  ProductListing,
} from '@/components/shop/ProductListing'
import { getCategory } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<ListingSearchParams>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategory(decodeURIComponent(slug))
  if (!category) return { title: 'Category not found' }
  const { q, size, sort, page } = parseListingParams(await searchParams)
  return buildMetadata({
    title: category.title,
    description: category.description,
    path: `/shop/${category.slug}`,
    image: category.image,
    noIndex: Boolean(q || size || sort !== 'featured' || page > 1),
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const category = await getCategory(decodeURIComponent(slug))
  if (!category) notFound()
  return <ProductListing category={category} searchParams={await searchParams} />
}
