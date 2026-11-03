import type { Payload } from 'payload'

/**
 * First-start setup for hosted deployments, run from Payload's `onInit`:
 *
 * - `INITIAL_ADMIN_EMAIL` + `INITIAL_ADMIN_PASSWORD`: create the first administrator when there
 *   are no staff accounts yet. This closes the window in which a stranger could claim a fresh
 *   site by visiting /admin before you do.
 * - `SEED_DEMO_CONTENT=true`: load the demo products and pages when the shop has no products.
 *
 * Both are no-ops once the database has content, so they are safe to leave set.
 */
export async function bootstrap(payload: Payload): Promise<void> {
  await createInitialAdmin(payload)

  if (process.env.SEED_DEMO_CONTENT === 'true') {
    const products = await payload.count({ collection: 'products', overrideAccess: true })
    if (products.totalDocs === 0) {
      payload.logger.info('SEED_DEMO_CONTENT is on and the shop is empty — loading demo content…')
      const { seed } = await import('../seed')
      await seed(payload)
    }
  }
}

const MIN_PASSWORD_LENGTH = 12

async function createInitialAdmin(payload: Payload): Promise<void> {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim()
  const password = process.env.INITIAL_ADMIN_PASSWORD
  if (!email || !password) return

  const users = await payload.count({ collection: 'users', overrideAccess: true })
  if (users.totalDocs > 0) return

  if (password.length < MIN_PASSWORD_LENGTH) {
    payload.logger.error(
      `INITIAL_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters — no admin account was created.`,
    )
    return
  }

  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Shop admin', roles: ['admin'] },
    overrideAccess: true,
  })
  payload.logger.info(`Created the first administrator account (${email}).`)
}
