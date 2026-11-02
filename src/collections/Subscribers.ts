import type { CollectionConfig } from 'payload'

import { nobody, staff } from '@/access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Newsletter subscriber', plural: 'Newsletter subscribers' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'createdAt'],
    group: 'Customers',
    description:
      'People who signed up to the newsletter. Export them to your email tool from here.',
  },
  access: {
    read: staff,
    update: staff,
    delete: staff,
    create: nobody,
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'source', type: 'text', admin: { readOnly: true } },
  ],
}
