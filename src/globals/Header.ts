import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access'
import { linkField } from '@/fields/link'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header & navigation',
  admin: { group: 'Content' },
  access: { read: anyone, update: staff },
  fields: [
    {
      name: 'announcement',
      type: 'group',
      label: 'Announcement bar',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'text',
          type: 'text',
          admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Link (optional)',
          admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
        },
      ],
    },
    {
      name: 'navItems',
      label: 'Menu',
      type: 'array',
      maxRows: 8,
      labels: { singular: 'Menu item', plural: 'Menu items' },
      fields: [linkField()],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidateTags([CACHE_TAGS.global('header')], req)
        return doc
      },
    ],
  },
}
