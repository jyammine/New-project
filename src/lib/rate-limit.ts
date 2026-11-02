import 'server-only'

import { headers } from 'next/headers'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()

/**
 * Small fixed-window rate limiter kept in memory.
 *
 * Good enough for a single server. If you run several instances behind a load balancer,
 * replace this with a shared store such as Redis or your platform's rate limiting.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  if (now - lastSweep > 60_000) {
    for (const [k, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(k)
    lastSweep = now
  }
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  bucket.count += 1
  if (bucket.count > limit)
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  return { ok: true, retryAfter: 0 }
}

export async function clientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return h.get('x-real-ip') || 'unknown'
}
