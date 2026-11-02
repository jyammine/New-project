import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { getPage } from '@/lib/queries'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(decodeURIComponent(slug))
  if (!page) return { title: 'Page not found' }
  return buildMetadata({ meta: page.meta, title: page.title, path: `/${page.slug}` })
}

export default async function CmsPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  if (slug === 'home') permanentRedirect('/')

  const page = await getPage(slug)
  if (!page) notFound()

  const startsWithHero = page.layout?.[0]?.blockType === 'hero'

  return (
    <article>
      {!startsWithHero && (
        <header className="container-page pt-12 pb-10 sm:pt-16">
          <h1 className="text-4xl sm:text-5xl">{page.title}</h1>
        </header>
      )}
      <RenderBlocks blocks={page.layout} />
    </article>
  )
}
