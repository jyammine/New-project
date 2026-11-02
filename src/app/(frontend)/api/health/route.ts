import { sql } from '@payloadcms/db-postgres'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** Liveness/readiness probe for load balancers and uptime monitors. */
export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadClient()
    const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } })
      .drizzle
    await db.execute(sql`select 1`)
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json(
      { status: 'error' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
