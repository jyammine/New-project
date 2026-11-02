import type { Metadata } from 'next'
import Link from 'next/link'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { JsonLd } from '@/components/JsonLd'
import { getPage, getSettings } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/urls'

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()])
  const siteName = settings?.siteName || 'Little Nest'
  const metadata = buildMetadata({
    meta: page?.meta,
    title: siteName,
    description: settings?.description,
    path: '/',
  })
  return {
    ...metadata,
    title: {
      absolute:
        page?.meta?.title || (settings?.tagline ? `${siteName} — ${settings.tagline}` : siteName),
    },
  }
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()])

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: settings?.siteName || 'Little Nest',
    url: absoluteUrl('/'),
    description: settings?.description || undefined,
    email: settings?.email || undefined,
    telephone: settings?.phone || undefined,
    address: settings?.address || undefined,
    sameAs: (settings?.social ?? []).map((s) => s.url),
  }

  if (!page) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl">Welcome to {settings?.siteName || 'Little Nest'}</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Create a page with the slug <code>home</code> in the admin panel to design this page.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            Browse the shop
          </Link>
          {/* The admin panel is a separate app shell, so use a full page load. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin" className="btn btn-secondary">
            Open admin
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <JsonLd data={organization} />
      <RenderBlocks blocks={page.layout} />
    </>
  )
}
