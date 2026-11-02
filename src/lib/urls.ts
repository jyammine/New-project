/**
 * Public URL of the site. `SERVER_URL` is read at runtime, so one build can be deployed to any
 * domain; `NEXT_PUBLIC_SERVER_URL` is supported for compatibility with Payload's templates.
 */
export const getServerSideURL = (): string => {
  const url =
    process.env.SERVER_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  return url.replace(/\/$/, '')
}

export const absoluteUrl = (path = '/'): string =>
  `${getServerSideURL()}${path.startsWith('/') ? path : `/${path}`}`

type Doc = { slug?: string | null } | null | undefined

export const pagePath = (doc: Doc): string =>
  !doc?.slug || doc.slug === 'home' ? '/' : `/${doc.slug}`

export const productPath = (doc: Doc): string => `/products/${doc?.slug ?? ''}`

export const categoryPath = (doc: Doc): string => `/shop/${doc?.slug ?? ''}`

export type LinkableCollection = 'pages' | 'products' | 'categories'

export const docPath = (relationTo: LinkableCollection | string, doc: Doc): string => {
  switch (relationTo) {
    case 'products':
      return productPath(doc)
    case 'categories':
      return categoryPath(doc)
    default:
      return pagePath(doc)
  }
}

/** URL that turns on Next.js draft mode (after verifying the Payload session) and redirects. */
export const previewUrl = (path: string): string =>
  `${getServerSideURL()}/next/preview?path=${encodeURIComponent(path)}`
