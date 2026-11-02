import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/urls'

// Rendered per request so the sitemap URL follows the runtime SERVER_URL.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/cart', '/checkout', '/next/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
