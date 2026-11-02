import { ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Price } from '@/components/Price'
import { AddToCart } from '@/components/product/AddToCart'
import { ProductGrid } from '@/components/product/ProductCard'
import { type GalleryImage, ProductGallery } from '@/components/product/ProductGallery'
import { RichText } from '@/components/RichText'
import { sizeLabel } from '@/lib/constants'
import { isMedia, mediaSrc, normalizeMediaUrl } from '@/lib/media'
import { getProduct, getRelatedProducts, getSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { absoluteUrl, categoryPath, productPath } from '@/lib/urls'
import type { Category } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(decodeURIComponent(slug))
  if (!product) return { title: 'Product not found' }
  const firstImage = product.images?.find(isMedia) ?? null
  return buildMetadata({
    meta: product.meta,
    title: product.title,
    description: product.shortDescription,
    path: productPath(product),
    image: firstImage,
    noIndex: product.status !== 'active',
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings] = await Promise.all([
    getProduct(decodeURIComponent(slug)),
    getSettings(),
  ])
  if (!product) notFound()

  const related = await getRelatedProducts(product)
  const currency = settings?.currency ?? 'USD'
  const locale = settings?.locale ?? 'en-US'
  const mainCategory = product.categories?.find(
    (c): c is Category => typeof c === 'object' && c !== null,
  )

  const gallery: GalleryImage[] = (product.images ?? []).filter(isMedia).flatMap((image) => {
    const src = normalizeMediaUrl(image.url)
    if (!src) return []
    return [
      {
        src,
        alt: image.alt ?? '',
        width: image.width ?? 1200,
        height: image.height ?? 1500,
        position:
          typeof image.focalX === 'number' && typeof image.focalY === 'number'
            ? `${image.focalX}% ${image.focalY}%`
            : undefined,
      },
    ]
  })

  const variants = (product.variants ?? [])
    .filter((v): v is typeof v & { id: string } => Boolean(v.id))
    .map((v) => ({ id: v.id, size: v.size, stock: Math.max(0, v.stock ?? 0) }))
  const inStock = variants.some((v) => v.stock > 0)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || undefined,
    image: gallery.map((img) => absoluteUrl(img.src)),
    sku: product.variants?.[0]?.sku || undefined,
    color: product.color || undefined,
    material: product.material || undefined,
    brand: { '@type': 'Brand', name: settings?.siteName || 'Little Nest' },
    offers: variants.map((variant) => ({
      '@type': 'Offer',
      url: absoluteUrl(productPath(product)),
      price: product.price.toFixed(2),
      priceCurrency: currency,
      availability:
        variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      sku: product.variants?.find((v) => v.id === variant.id)?.sku || undefined,
      name: `${product.title} – ${sizeLabel(variant.size)}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shop', item: absoluteUrl('/shop') },
      ...(mainCategory
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: mainCategory.title,
              item: absoluteUrl(categoryPath(mainCategory)),
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: mainCategory ? 3 : 2,
        name: product.title,
        item: absoluteUrl(productPath(product)),
      },
    ],
  }

  const deliveryMin = settings?.deliveryEstimate?.min
  const deliveryMax = settings?.deliveryEstimate?.max

  return (
    <div className="container-page pt-6 sm:pt-10">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>
          </li>
          {mainCategory && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={categoryPath(mainCategory)} className="hover:underline">
                  {mainCategory.title}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={gallery} title={product.title} />

        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          {product.status !== 'active' && (
            <p className="rounded-2xl bg-butter px-4 py-2 text-sm font-bold">
              This product is {product.status} and hidden from customers.
            </p>
          )}
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">{product.title}</h1>
            {product.color && <p className="mt-2 text-ink-soft">{product.color}</p>}
          </div>
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            currency={currency}
            locale={locale}
            size="lg"
          />
          {product.shortDescription && (
            <p className="text-lg text-ink-soft">{product.shortDescription}</p>
          )}

          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              image: mediaSrc(product.images?.find(isMedia), 'thumbnail'),
              variants,
            }}
            lowStockThreshold={settings?.lowStockThreshold ?? 3}
          />

          {settings?.productPageNote && (
            <p className="rounded-2xl bg-sage/60 px-5 py-4 text-sm font-semibold text-sage-strong">
              {settings.productPageNote}
            </p>
          )}
          {inStock && deliveryMin && deliveryMax && (
            <p className="text-sm text-ink-soft">
              Ships within 1 business day · Delivery in {deliveryMin}–{deliveryMax} business days
            </p>
          )}

          <div className="divide-y divide-line border-y border-line">
            {product.description && (
              <Disclosure title="Description" defaultOpen>
                <RichText data={product.description} className="prose-base" />
              </Disclosure>
            )}
            {(product.material || product.features?.length || product.careInstructions) && (
              <Disclosure title="Materials & care">
                <div className="flex flex-col gap-3 text-ink-soft">
                  {product.material && (
                    <p>
                      <strong className="text-ink">Material:</strong> {product.material}
                    </p>
                  )}
                  {product.features && product.features.length > 0 && (
                    <ul className="list-disc pl-5">
                      {product.features.map((feature) => (
                        <li key={feature.id ?? feature.text}>{feature.text}</li>
                      ))}
                    </ul>
                  )}
                  {product.careInstructions && (
                    <p className="whitespace-pre-line">{product.careInstructions}</p>
                  )}
                </div>
              </Disclosure>
            )}
            <Disclosure title="Shipping & returns">
              <p className="text-ink-soft">
                Orders are packed with care in our studio and usually ship within one business day.
                Unworn items can be returned within 30 days.{' '}
                <Link
                  href="/shipping-returns"
                  className="font-bold text-ink underline underline-offset-4"
                >
                  Read our shipping &amp; returns policy
                </Link>
                .
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-8 text-3xl sm:text-4xl">
            You may also like
          </h2>
          <ProductGrid products={related} currency={currency} locale={locale} />
        </section>
      )}
    </div>
  )
}

function Disclosure({
  title,
  children,
  defaultOpen,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className="group py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  )
}
