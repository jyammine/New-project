import type { CollectionConfig } from 'payload'

import { nobody, staff } from '@/access'
import { sendInquiryNotification } from '@/emails/send'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'email', 'status', 'createdAt'],
    group: 'Customers',
    description: 'Messages sent through the contact form.',
  },
  defaultSort: '-createdAt',
  access: {
    read: staff,
    update: staff,
    delete: staff,
    create: nobody,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
      ],
    },
    { name: 'subject', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'message', type: 'textarea', required: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        try {
          await sendInquiryNotification(req.payload, doc)
        } catch (err) {
          req.payload.logger.error({ err, msg: 'Failed to send contact form notification' })
        }
        return doc
      },
    ],
  },
}
