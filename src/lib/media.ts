import type { Media } from '@/payload-types'

import { getServerSideURL } from './urls'

export type MaybeMedia = Media | number | string | null | undefined

export const isMedia = (value: MaybeMedia): value is Media =>
  typeof value === 'object' && value !== null && 'url' in value

/**
 * Payload returns absolute URLs when `serverURL` is configured. Convert our own URLs back to
 * relative paths so `next/image` treats them as local images.
 */
export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  const server = getServerSideURL()
  if (url.startsWith(server)) return url.slice(server.length) || '/'
  return url
}

export const mediaSrc = (media: MaybeMedia, size?: 'thumbnail' | 'card' | 'og'): string | null => {
  if (!isMedia(media)) return null
  const sized = size ? media.sizes?.[size]?.url : null
  return normalizeMediaUrl(sized || media.url)
}

export const firstMedia = (list: MaybeMedia[] | null | undefined): Media | null =>
  (list ?? []).find(isMedia) ?? null
