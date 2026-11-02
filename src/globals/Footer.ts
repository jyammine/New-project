import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access'
import { linkField } from '@/fields/link'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Content' },
  access: { read: anyone, update: staff },
  fields: [
    {
      name: 'blurb',
      type: 'textarea',
      admin: { description: 'A short sentence about the shop, shown next to the logo.' },
    },
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      labels: { singular: 'Link column', plural: 'Link columns' },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          maxRows: 8,
          fields: [linkField()],
        },
      ],
    },
    {
      name: 'newsletter',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'heading', type: 'text', defaultValue: 'Join the nest' },
        {
          name: 'text',
          type: 'textarea',
          defaultValue: 'New arrivals, restocks and the occasional treat. No spam, ever.',
        },
      ],
    },
    {
      name: 'legalText',
      type: 'text',
      admin: { description: 'Shown at the very bottom, after the © year and shop name.' },
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidateTags([CACHE_TAGS.global('footer')], req)
        return doc
      },
    ],
  },
}
