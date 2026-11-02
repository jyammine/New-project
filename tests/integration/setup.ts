/**
 * Integration tests run against a real Postgres database.
 * Set DATABASE_URL_TEST to point at a disposable database; its content is deleted.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST || 'postgres://postgres:postgres@localhost:5432/littlenest_test'
process.env.PAYLOAD_SECRET ||= 'integration-test-secret-0123456789abcdef'
process.env.SERVER_URL ||= 'http://localhost:3000'
// Stripe calls are never made over the network in these tests; the keys only enable code paths.
process.env.STRIPE_SECRET_KEY = 'sk_test_integration'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_integration_test_secret'
delete process.env.SMTP_HOST
