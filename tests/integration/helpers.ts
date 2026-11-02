import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let instance: Payload | null = null

export async function getTestPayload(): Promise<Payload> {
  if (!instance) instance = await getPayload({ config })
  return instance
}

export async function resetDatabase(payload: Payload): Promise<void> {
  for (const collection of [
    'orders',
    'products',
    'categories',
    'pages',
    'media',
    'subscribers',
    'inquiries',
    'users',
  ] as const) {
    await payload.delete({
      collection,
      where: { id: { exists: true } },
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  }
}

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

export async function createProduct(
  payload: Payload,
  overrides: { price?: number; status?: 'active' | 'draft'; stock?: number[]; slug?: string } = {},
) {
  const image = await payload.create({
    collection: 'media',
    data: { alt: 'Test image' },
    file: {
      data: PIXEL,
      mimetype: 'image/png',
      name: `pixel-${Date.now()}.png`,
      size: PIXEL.length,
    },
    overrideAccess: true,
  })
  const stock = overrides.stock ?? [5, 1]
  return payload.create({
    collection: 'products',
    data: {
      title: 'Test Bodysuit',
      slug: overrides.slug ?? `test-bodysuit-${Math.random().toString(36).slice(2, 8)}`,
      status: overrides.status ?? 'active',
      price: overrides.price ?? 20,
      images: [image.id],
      variants: [
        { size: '0-3m', stock: stock[0] ?? 0 },
        { size: '3-6m', stock: stock[1] ?? 0 },
      ],
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
}
