import path from 'path'
import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Media library' },
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: staff,
    update: staff,
    delete: staff,
  },
  folders: true,
  fields: [
    {
      name: 'alt',
      label: 'Alternative text',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image for screen readers and search engines.',
      },
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    // SVG is intentionally excluded: user-uploaded SVGs can carry scripts.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
    // Keep originals at a sensible size so phone photos don't bloat storage.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 900, height: 900, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
}
