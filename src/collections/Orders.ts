import type { CollectionConfig } from 'payload'

import { adminOnly, nobody, staff } from '@/access'
import { SIZES } from '@/lib/constants'
import { sendShippingConfirmation } from '@/emails/send'

export const ORDER_STATUSES = [
  { label: 'Awaiting payment', value: 'pending' },
  { label: 'Paid – to be packed', value: 'paid' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Abandoned checkout', value: 'abandoned' },
] as const

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerName', 'email', 'total', 'status', 'createdAt'],
    group: 'Shop',
    listSearchableFields: ['orderNumber', 'email', 'customerName'],
    description:
      'Orders are created automatically at checkout. Update the status and tracking number when you ship.',
  },
  defaultSort: '-createdAt',
  access: {
    read: staff,
    update: staff,
    create: nobody,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'orderNumber',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { readOnly: true, width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          index: true,
          options: ORDER_STATUSES.map(({ label, value }) => ({ label, value })),
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'stockWarning',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          'Set when there was not enough stock for every item when payment was received. Check the order before shipping.',
        condition: (data) => Boolean(data?.stockWarning),
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Items',
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 1,
              admin: { readOnly: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      type: 'relationship',
                      relationTo: 'products',
                      admin: { width: '40%' },
                    },
                    { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'variantId', type: 'text', required: true, admin: { hidden: true } },
                    {
                      name: 'size',
                      type: 'select',
                      options: SIZES.map(({ label, value }) => ({ label, value })),
                      admin: { width: '25%' },
                    },
                    { name: 'sku', type: 'text', admin: { width: '25%' } },
                    { name: 'unitPrice', type: 'number', required: true, admin: { width: '25%' } },
                    { name: 'quantity', type: 'number', required: true, admin: { width: '25%' } },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'subtotal', type: 'number', required: true, admin: { readOnly: true } },
                {
                  name: 'shippingTotal',
                  type: 'number',
                  defaultValue: 0,
                  admin: { readOnly: true },
                },
                { name: 'taxTotal', type: 'number', defaultValue: 0, admin: { readOnly: true } },
                {
                  name: 'discountTotal',
                  type: 'number',
                  defaultValue: 0,
                  admin: { readOnly: true },
                },
                { name: 'total', type: 'number', required: true, admin: { readOnly: true } },
              ],
            },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'USD',
              admin: { readOnly: true },
            },
          ],
        },
        {
          label: 'Customer',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'customerName', type: 'text' },
                { name: 'email', type: 'email', index: true },
                { name: 'phone', type: 'text' },
              ],
            },
            {
              name: 'shippingAddress',
              type: 'group',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'line1', label: 'Address line 1', type: 'text' },
                { name: 'line2', label: 'Address line 2', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text' },
                    { name: 'state', label: 'State / region', type: 'text' },
                    { name: 'postalCode', type: 'text' },
                    { name: 'country', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Fulfilment',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'trackingCarrier',
                  type: 'text',
                  admin: { placeholder: 'USPS, Royal Mail…' },
                },
                { name: 'trackingNumber', type: 'text' },
                { name: 'trackingUrl', type: 'text', label: 'Tracking link' },
              ],
            },
            {
              name: 'notifyCustomerOnShip',
              type: 'checkbox',
              defaultValue: true,
              label: 'Email the customer when the status changes to “Shipped”',
            },
            { name: 'internalNotes', type: 'textarea' },
          ],
        },
        {
          label: 'Payment',
          fields: [
            { name: 'paidAt', type: 'date', admin: { readOnly: true } },
            { name: 'shippedAt', type: 'date', admin: { readOnly: true } },
            {
              name: 'stripeCheckoutSessionId',
              type: 'text',
              unique: true,
              index: true,
              admin: { readOnly: true },
            },
            { name: 'stripePaymentIntentId', type: 'text', index: true, admin: { readOnly: true } },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data?.status === 'shipped' && originalDoc?.status !== 'shipped' && !data.shippedAt) {
          data.shippedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return doc
        if (
          doc.status === 'shipped' &&
          previousDoc?.status !== 'shipped' &&
          doc.notifyCustomerOnShip
        ) {
          try {
            await sendShippingConfirmation(req.payload, doc)
          } catch (err) {
            req.payload.logger.error({
              err,
              msg: `Failed to send shipping email for ${doc.orderNumber}`,
            })
          }
        }
        return doc
      },
    ],
  },
}
