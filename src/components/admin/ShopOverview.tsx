import type { Payload } from 'payload'

import { formatMoney } from '@/lib/money'

import { RefreshCacheButton } from './RefreshCacheButton'

type Props = { payload: Payload }

const card: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: '16px 20px',
  background: 'var(--theme-elevation-0)',
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
}

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

/** Small at-a-glance panel shown above the admin dashboard. */
export async function ShopOverview({ payload }: Props) {
  const since = daysAgo(30)

  const [toShip, recentPaid, newMessages, settings, products] = await Promise.all([
    payload.count({ collection: 'orders', where: { status: { equals: 'paid' } } }),
    payload.find({
      collection: 'orders',
      where: {
        and: [
          { paidAt: { greater_than: since } },
          { status: { in: ['paid', 'shipped', 'delivered'] } },
        ],
      },
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { total: true },
    }),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'new' } } }),
    payload.findGlobal({ slug: 'settings', depth: 0 }),
    payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      depth: 0,
      pagination: false,
      limit: 1000,
      select: { variants: true },
    }),
  ])

  const revenue = recentPaid.docs.reduce((sum, order) => sum + (order.total ?? 0), 0)
  const lowStockLimit = settings?.lowStockThreshold ?? 3
  const lowStock = products.docs.filter((product) =>
    (product.variants ?? []).some((variant) => (variant.stock ?? 0) <= lowStockLimit),
  ).length

  const stats = [
    {
      label: 'Orders to ship',
      value: String(toShip.totalDocs),
      href: '/admin/collections/orders?where[status][equals]=paid',
    },
    {
      label: 'Revenue, last 30 days',
      value: formatMoney(revenue, settings?.currency || 'USD', settings?.locale || 'en-US'),
      href: '/admin/collections/orders',
    },
    {
      label: 'New messages',
      value: String(newMessages.totalDocs),
      href: '/admin/collections/inquiries?where[status][equals]=new',
    },
    {
      label: 'Products low on stock',
      value: String(lowStock),
      href: '/admin/collections/products',
    },
  ]

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: 0 }}>Shop overview</h2>
        <RefreshCacheButton />
      </div>
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {stats.map((stat) => (
          <a key={stat.label} href={stat.href} style={card}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{stat.label}</div>
            <div style={{ fontSize: 28, marginTop: 4 }}>{stat.value}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
