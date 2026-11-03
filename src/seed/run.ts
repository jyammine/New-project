/**
 * Seed the database with demo content.
 *
 *   pnpm seed            # only seeds an empty database
 *   pnpm seed reset      # deletes products, pages, media and orders first (or SEED_RESET=true)
 *
 * Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to also create an admin account.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './index'

const payload = await getPayload({ config })

// `payload run` only forwards positional arguments, so the flag is written without dashes.
const reset = process.argv.slice(2).includes('reset') || process.env.SEED_RESET === 'true'
// SEED_ADMIN_* are the older names for the same settings.
const email = process.env.INITIAL_ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL
const password = process.env.INITIAL_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD

try {
  const result = await seed(payload, {
    reset,
    admin: email && password ? { email, password } : undefined,
  })
  if (!result.skipped) {
    payload.logger.info(
      'If the site is already running, click “Refresh site cache” on the admin dashboard to show the new content.',
    )
  }
  process.exit(0)
} catch (err) {
  payload.logger.error({ err, msg: 'Seeding failed' })
  process.exit(1)
}
