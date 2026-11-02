import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** Enables draft mode for logged-in staff, then redirects to the page being previewed. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'

  // Only allow same-site relative paths to prevent open redirects.
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return new Response('You need to be logged in to the admin panel to preview content.', {
      status: 403,
    })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
