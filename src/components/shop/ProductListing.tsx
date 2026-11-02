import Link from 'next/link'

import { ProductGrid } from '@/components/product/ProductCard'
import { cn } from '@/components/ui/cn'
import { SIZES } from '@/lib/constants'
import {
  getCategories,
  getSettings,
  isProductSort,
  listProducts,
  PRODUCT_SORTS,
} from '@/lib/queries'
import type { Category } from '@/payload-types'

import { AutoSubmitSelect } from './AutoSubmitSelect'

export type ListingSearchParams = Record<string, string | string[] | undefined>

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export function parseListingParams(searchParams: ListingSearchParams) {
  const q = first(searchParams.q)?.trim().slice(0, 80) || undefined
  const rawSort = first(searchParams.sort)
  const sort = isProductSort(rawSort) ? rawSort : 'featured'
  const rawSize = first(searchParams.size)
  const size = SIZES.some((s) => s.value === rawSize) ? rawSize : undefined
  const page = Math.min(500, Math.max(1, Number.parseInt(first(searchParams.page) ?? '1', 10) || 1))
  const focus = first(searchParams.focus)
  return { q, sort, size, page, focus }
}

type Props = {
  category?: Category | null
  searchParams: ListingSearchParams
}

export async function ProductListing({ category, searchParams }: Props) {
  const { q, sort, size, page, focus } = parseListingParams(searchParams)
  const basePath = category ? `/shop/${category.slug}` : '/shop'

  const [settings, categories, result] = await Promise.all([
    getSettings(),
    getCategories(),
    listProducts({ categoryId: category?.id, size, query: q, sort, page, limit: 12 }),
  ])

  const hrefWith = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    const merged = {
      q,
      sort: sort === 'featured' ? undefined : sort,
      size,
      page: undefined,
      ...overrides,
    }
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== '' && !(key === 'page' && Number(value) === 1))
        params.set(key, String(value))
    }
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const title = category?.title ?? (q ? `Results for “${q}”` : 'Shop all')

  return (
    <div className="container-page pt-10 sm:pt-14">
      <header className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-ink-soft">
          <ol className="flex gap-2">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              {category ? (
                <Link href="/shop" className="hover:underline">
                  Shop
                </Link>
              ) : (
                <span aria-current="page">Shop</span>
              )}
            </li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li aria-current="page">{category.title}</li>
              </>
            )}
          </ol>
        </nav>
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {category?.description && (
          <p className="mt-4 text-lg text-ink-soft">{category.description}</p>
        )}
      </header>

      <nav aria-label="Categories" className="-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 pb-1">
          <li>
            <Link
              href="/shop"
              className={cn(
                'block rounded-full border px-4 py-2 text-sm font-bold whitespace-nowrap',
                !category
                  ? 'border-ink bg-ink text-cream'
                  : 'border-line bg-white hover:border-ink/40',
              )}
              aria-current={!category ? 'page' : undefined}
            >
              All
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/shop/${c.slug}`}
                className={cn(
                  'block rounded-full border px-4 py-2 text-sm font-bold whitespace-nowrap',
                  category?.id === c.id
                    ? 'border-ink bg-ink text-cream'
                    : 'border-line bg-white hover:border-ink/40',
                )}
                aria-current={category?.id === c.id ? 'page' : undefined}
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <form
        method="get"
        action={basePath}
        role="search"
        className="mt-6 flex flex-col gap-3 border-y border-line py-4 md:flex-row md:items-center"
      >
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <input
          id="shop-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search bodysuits, hats, blankets…"
          className="input rounded-full md:max-w-sm"
          autoFocus={focus === 'search'}
          maxLength={80}
        />
        <div className="flex flex-1 flex-wrap items-center gap-3 md:justify-end">
          <label className="flex items-center gap-2 text-sm font-semibold">
            Size
            <AutoSubmitSelect
              name="size"
              defaultValue={size ?? ''}
              className="input w-auto rounded-full py-2"
            >
              <option value="">All sizes</option>
              {SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            Sort
            <AutoSubmitSelect
              name="sort"
              defaultValue={sort}
              className="input w-auto rounded-full py-2"
            >
              {Object.entries(PRODUCT_SORTS).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </div>
      </form>

      <div className="mt-6 mb-6 flex items-center justify-between text-sm text-ink-soft">
        <p aria-live="polite">
          {result.totalDocs} {result.totalDocs === 1 ? 'product' : 'products'}
        </p>
        {(q || size || sort !== 'featured') && (
          <Link href={basePath} className="font-bold text-ink underline underline-offset-4">
            Clear filters
          </Link>
        )}
      </div>

      {result.docs.length > 0 ? (
        <ProductGrid
          products={result.docs}
          currency={settings?.currency ?? 'USD'}
          locale={settings?.locale ?? 'en-US'}
          prioritizeFirst
        />
      ) : (
        <div className="rounded-[2rem] bg-sand px-6 py-16 text-center">
          <h2 className="text-2xl">Nothing here yet</h2>
          <p className="mt-2 text-ink-soft">Try another size or search term.</p>
          <Link href="/shop" className="btn btn-primary mt-6">
            See all products
          </Link>
        </div>
      )}

      {result.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          {result.hasPrevPage && (
            <Link
              href={hrefWith({ page: result.prevPage ?? 1 })}
              className="btn btn-secondary"
              rel="prev"
            >
              Previous
            </Link>
          )}
          <span className="px-4 text-sm text-ink-soft">
            Page {result.page} of {result.totalPages}
          </span>
          {result.hasNextPage && (
            <Link
              href={hrefWith({ page: result.nextPage ?? page + 1 })}
              className="btn btn-secondary"
              rel="next"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
