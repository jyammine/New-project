import { docPath } from './urls'

export type LinkData = {
  type?: 'reference' | 'custom' | null
  newTab?: boolean | null
  reference?: { relationTo: string; value: unknown } | null
  url?: string | null
  label?: string | null
  appearance?: 'primary' | 'secondary' | 'link' | null
}

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i

export function resolveHref(link: LinkData | null | undefined): string | null {
  if (!link) return null
  if (link.type === 'custom') {
    const url = link.url?.trim()
    return url && SAFE_URL.test(url) ? url : null
  }
  const ref = link.reference
  if (ref && typeof ref.value === 'object' && ref.value !== null) {
    return docPath(ref.relationTo, ref.value as { slug?: string })
  }
  return null
}
