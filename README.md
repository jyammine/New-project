# Little Nest — baby clothing shop

An online shop for a baby clothing brand, with a built-in content management system (CMS). Staff can
manage products, stock, orders and every page of the site from a friendly admin panel, and
customers pay securely through Stripe.

- **Storefront**: home page, shop with category, size and search filters, product pages with a
  size picker and stock levels, bag/cart, checkout, order confirmation, and content pages (about, FAQ,
  size guide, shipping & returns, contact, legal).
- **CMS** at `/admin` (Payload CMS): products and sizes with stock, categories, orders with
  fulfilment and tracking, a page builder with 12 content blocks, navigation, footer, shop settings,
  newsletter subscribers and contact messages. Pages have drafts, version history and live preview.
- **Payments**: Stripe Checkout (cards, Apple Pay, Google Pay, Link…), shipping rates and free-shipping
  threshold from the CMS, optional Stripe Tax and promotion codes. Stock is reduced only when payment
  succeeds.
- **Emails**: order confirmation, shipping notification with tracking, and staff notifications for new
  orders and contact messages.
- **Production basics**: SEO metadata, sitemap, robots.txt, Product JSON-LD, accessible components,
  security headers, rate-limited forms with spam protection, database migrations, health check,
  Docker image, CI pipeline, unit, integration and end-to-end tests.

## Tech stack

| Part          | Choice                                                                |
| ------------- | --------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript)   |
| CMS           | [Payload 3](https://payloadcms.com), running inside the same Next app |
| Database      | PostgreSQL 16                                                         |
| Payments      | [Stripe Checkout](https://stripe.com/payments/checkout)               |
| Styling       | Tailwind CSS 4, self-hosted Fraunces and Nunito fonts                 |
| Media storage | Local disk (default) or any S3-compatible bucket                      |
| Email         | Any SMTP provider (Postmark, SendGrid, Mailgun, SES, …)               |
| Tests         | Vitest (unit + integration), Playwright (end-to-end)                  |

---

## Quick start (local development)

Requirements: Node.js 22.23+ (or 24.22+), pnpm 10, and PostgreSQL 16 (or Docker).

```bash
pnpm install
cp .env.example .env              # then edit DATABASE_URL and PAYLOAD_SECRET

# Optional: start Postgres with Docker (matches the DATABASE_URL in .env.example)
docker compose up -d db

pnpm dev                          # http://localhost:3000
```

In development the database schema is synced automatically. To fill the shop with demo products,
pages and illustrations:

```bash
INITIAL_ADMIN_EMAIL=you@example.com INITIAL_ADMIN_PASSWORD='a-long-password' pnpm seed
```

Then open <http://localhost:3000/admin> and log in. Without the `INITIAL_ADMIN_*` variables, visit
`/admin` and create the first account yourself — **the first account is always an administrator**.

`pnpm seed` only runs on an empty database. `pnpm seed reset` deletes existing products, pages,
media and orders first.

---

## Environment variables

Copy `.env.example` to `.env`. Only the first three are required.

| Variable                                                                                                   | Required | Description                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                             | ✅       | Postgres connection string.                                                                                                        |
| `PAYLOAD_SECRET`                                                                                           | ✅       | Random string of at least 32 characters (`openssl rand -hex 32`). The app refuses to start in production without it.               |
| `SERVER_URL`                                                                                               | ✅       | Public URL without trailing slash, e.g. `https://littlenest.com`. Must match the address customers and staff use. Read at runtime. |
| `STRIPE_SECRET_KEY`                                                                                        |          | Enables checkout. Without it the cart shows “checkout coming soon”.                                                                |
| `STRIPE_WEBHOOK_SECRET`                                                                                    |          | Signing secret of the webhook endpoint (see below).                                                                                |
| `STRIPE_AUTOMATIC_TAX`                                                                                     |          | `true` to calculate tax with Stripe Tax.                                                                                           |
| `STRIPE_TAX_BEHAVIOR`                                                                                      |          | With Stripe Tax: `inclusive` (prices include tax, default) or `exclusive` (tax added at checkout).                                 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`                                                         |          | SMTP server for emails. Without it, emails are written to the server log.                                                          |
| `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`                                                                    |          | Sender of outgoing emails.                                                                                                         |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` |          | Store uploads in S3, Cloudflare R2, DigitalOcean Spaces, MinIO… instead of local disk.                                             |
| `MEDIA_DIR`                                                                                                |          | Folder for uploads when using local disk (default `./media`).                                                                      |
| `DATABASE_POOL_MAX`                                                                                        |          | Max database connections per app instance (default 10).                                                                            |
| `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`                                                            |          | Creates the first administrator on start-up while there are no staff accounts (password 12+ characters).                           |
| `SEED_DEMO_CONTENT`                                                                                        |          | `true` loads the demo products and pages on start-up while the shop has no products.                                               |

---

## Setting up payments (Stripe)

1. Create a Stripe account and copy the **secret key** into `STRIPE_SECRET_KEY` (use `sk_test_…` while
   testing).
2. Add a webhook endpoint in **Stripe Dashboard → Developers → Webhooks** pointing to
   `https://YOUR-DOMAIN/api/stripe/webhook` with these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `charge.refunded`
3. Copy the endpoint’s **signing secret** into `STRIPE_WEBHOOK_SECRET`.

For local testing use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints a whsec_… secret
```

**How an order flows**

1. The customer clicks _Check out_. The server re-prices the bag from the database (prices sent by the
   browser are never trusted), checks stock, creates an order with status _Awaiting payment_ and
   redirects to Stripe.
2. When Stripe confirms payment, the webhook marks the order _Paid_, saves the customer and shipping
   details, reduces stock and sends the confirmation emails. Webhook retries are safe: an order is
   only processed once. If the webhook is slow, the confirmation page checks with Stripe directly.
3. If two customers buy the last item at the same moment, the second order is still accepted but gets
   a **stock warning** in the admin so you can contact the customer.
4. Unpaid checkouts expire after one hour and are marked _Abandoned checkout_.
5. Refunds made in Stripe mark the order _Refunded_.

Shipping price, free-shipping threshold, delivery estimate, allowed countries and promotion codes are
set in **Admin → Site settings → Shop & shipping**. To have Stripe calculate tax, set
`STRIPE_AUTOMATIC_TAX=true` and `STRIPE_TAX_BEHAVIOR` to `inclusive` (shop prices include tax) or
`exclusive` (tax is added at checkout), and set up Stripe Tax in your Stripe dashboard.

---

## Using the admin panel

Everything is at `/admin`.

| Section                      | What it’s for                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**                | Orders to ship, revenue for the last 30 days, new messages, products low on stock.                                                                                                                                                                                                                                                                                  |
| **Shop → Products**          | Title, images, description, price and compare-at price (sale), sizes with SKU and stock, materials and care, category, badge, “featured”, related products and SEO. **Status** controls visibility: only _Active_ products appear in the shop. Use _Preview_ to see a draft product.                                                                                |
| **Shop → Categories**        | Category pages at `/shop/<slug>` and tiles on the home page.                                                                                                                                                                                                                                                                                                        |
| **Shop → Orders**            | Created automatically. To ship: add the carrier, tracking number and link, then set status to _Shipped_ — the customer is emailed automatically.                                                                                                                                                                                                                    |
| **Content → Pages**          | Build pages from blocks: hero, product grid, category tiles, text, image with text, highlights, testimonials, FAQ, call to action, table (size guides), newsletter signup and contact form. The page with slug `home` is the home page. Changes autosave as drafts until you click _Publish_; the _Live preview_ tab shows them at phone, tablet and desktop sizes. |
| **Content → Header**         | Announcement bar and the main menu.                                                                                                                                                                                                                                                                                                                                 |
| **Content → Footer**         | Footer text, link columns and the newsletter box.                                                                                                                                                                                                                                                                                                                   |
| **Customers**                | Newsletter subscribers (exportable from the list view) and contact form messages.                                                                                                                                                                                                                                                                                   |
| **Settings → Staff**         | Staff accounts. _Administrators_ can manage staff and site settings; _Editors_ manage products, pages and orders. Accounts lock for 15 minutes after 5 failed logins.                                                                                                                                                                                               |
| **Settings → Site settings** | Shop name, logo, SEO defaults, currency and price format, shipping, contact details, opening hours, social links and where staff notifications go.                                                                                                                                                                                                                  |

Changes appear on the site immediately. If you change data outside the admin panel (seed script,
direct database edits), click **Refresh site cache** on the dashboard.

---

## Deployment

The app is a single Node.js service plus a Postgres database. Database migrations run automatically
when the app starts in production.

### Option A — Render (one click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jyammine/New-project)

`render.yaml` describes everything Render needs: the web service (built from the `Dockerfile`), a
Postgres database, a 1 GB disk for uploaded images, and a generated `PAYLOAD_SECRET`.

1. Click the button above (or in Render: **New → Blueprint** and pick this repository) and sign in
   with GitHub.
2. Enter `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` (12+ characters) when asked — this is
   your login for `/admin`. Then click **Apply** / **Deploy Blueprint**.
3. Wait for the first build (5–10 minutes). The first start also loads the demo shop, which takes
   about half a minute.
4. Open the `https://little-nest-….onrender.com` address shown on the service page, and
   `/admin` for the CMS.

Costs: persistent disks need a paid instance, so the Blueprint uses Render’s smallest paid web
instance (Starter) and its default paid Postgres plan — roughly $15 a month together at the time of
writing; check [Render’s pricing](https://render.com/pricing). To take orders later, add the Stripe
and SMTP variables under the service’s **Environment** tab, and set `SERVER_URL` when you connect your
own domain. Pushing to the deployed branch redeploys automatically.

### Option B — Docker Compose on a server

On any VPS (Hetzner, DigitalOcean, Lightsail, …) with Docker installed:

```bash
git clone <this repo> && cd <repo>
cp .env.example .env          # set PAYLOAD_SECRET, SERVER_URL, Stripe and SMTP settings
# (DATABASE_URL is set by docker-compose.yml; choose a strong POSTGRES_PASSWORD in .env)
# If the server already runs Postgres on port 5432, also set POSTGRES_PORT in .env.
docker compose up -d --build
docker compose run --rm tools pnpm seed     # optional demo content
```

Put a reverse proxy with HTTPS in front of port 3000 (Caddy, Nginx, Traefik, or your host’s load
balancer). Uploaded images are stored in the `media` volume and the database in `pgdata` — back up
both.

### Option C — Other container platforms (Railway, Fly.io, Google Cloud Run, …)

Build the `Dockerfile` (default target is the production image), attach a managed Postgres database,
and set the environment variables above. Configure S3-compatible storage for uploads unless the
platform offers a persistent disk. The health check endpoint is `GET /api/health`. The image starts
as root only long enough to make the media folder writable, then runs the app as an unprivileged
user. Render and Railway addresses are detected automatically; elsewhere set `SERVER_URL`.

### Option D — Vercel or other serverless hosts

Works with a managed Postgres (Neon, Supabase, Vercel Postgres) and **S3 storage is required** because
the filesystem is not persistent. Set `DATABASE_POOL_MAX` low (e.g. `3`) or use a pooled connection
string.

### Scaling notes

The defaults are tuned for a single app instance, which comfortably serves a small shop. Before running
several instances: use S3 storage, replace the in-memory rate limiter in `src/lib/rate-limit.ts` with
a shared store (e.g. Redis), and configure a shared
[Next.js cache handler](https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr) so cache
invalidation reaches every instance.

### Changing the data model

Development uses automatic schema sync. When you change a collection or field, create a migration and
commit it — production applies it on the next start:

```bash
pnpm migrate:create describe-your-change
pnpm generate:types
```

Keep separate databases for development and production.

---

## Before you go live — checklist

- [ ] Set **Site settings** (name, logo, contact details, address, opening hours, social links,
      currency and locale). Replace “Little Nest” in `src/payload.config.ts` (admin title and SEO
      title suffix) and `src/components/admin/Brand.tsx` if you rename the shop.
- [ ] Replace the illustrated demo images with real product photos, and review all product data.
- [ ] Rewrite the **Privacy policy**, **Terms** and **Shipping & returns** pages — the seeded versions
      are placeholders, not legal advice.
- [ ] Switch Stripe to **live keys** and create the live webhook endpoint.
- [ ] Configure **SMTP** and send yourself a test order. Set up SPF/DKIM for your sending domain.
- [ ] Set `SERVER_URL` to the real domain, serve the site over HTTPS, and submit `/sitemap.xml` to
      Google Search Console.
- [ ] Create staff accounts with strong passwords; remove any demo admin account.
- [ ] Set up daily database and media backups and an uptime monitor on `/api/health`.

---

## Development

```bash
pnpm dev                 # start the dev server
pnpm lint                # ESLint
pnpm typecheck           # TypeScript
pnpm format              # Prettier
pnpm test:unit           # pricing, cart, emails, links…
pnpm test:integration    # orders, Stripe webhooks, stock and access control against Postgres
pnpm test:e2e            # browser tests (needs a seeded database: pnpm seed reset)
pnpm generate:types      # regenerate src/payload-types.ts after schema changes
pnpm generate:importmap  # after adding custom admin components
```

Integration tests use `DATABASE_URL_TEST` (default
`postgres://postgres:postgres@localhost:5432/littlenest_test`) and **delete its contents**. CI runs
every check above on each push and pull request (`.github/workflows/ci.yml`).

### Project structure

```
src/
  app/(frontend)/      Storefront routes, Stripe webhook, health check, sitemap
  app/(payload)/       Admin panel and CMS API (generated by Payload)
  collections/         Products, categories, orders, pages, media, staff, subscribers, messages
  globals/             Header, footer and site settings
  blocks/              Page-builder block definitions
  components/          Storefront UI (blocks, cart, product, layout, forms) and admin widgets
  emails/              Transactional email templates
  lib/                 Pricing, checkout, orders, queries and caching, Stripe, helpers
  migrations/          Database migrations
  seed/                Demo content and illustrations
tests/                 Unit, integration and end-to-end tests
```
