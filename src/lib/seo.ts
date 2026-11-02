import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

import { mediaSrc } from './media'

type Meta =
  | { title?: string | null; description?: string | null; image?: Media | number | null }
  | null
  | undefined

export function buildMetadata({
  meta,
  title,
  description,
  path,
  image,
  noIndex,
}: {
  meta?: Meta
  title: string
  description?: string | null
  path: string
  image?: Media | number | null
  noIndex?: boolean
}): Metadata {
  const resolvedTitle = meta?.title || title
  const resolvedDescription = meta?.description || description || undefined
  const imageUrl = mediaSrc(meta?.image ?? image, 'og') || mediaSrc(image ?? null)

  return {
    // Meta titles from the SEO plugin already contain the site name.
    title: meta?.title ? { absolute: meta.title } : resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: path },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: path,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}
