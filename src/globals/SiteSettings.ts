import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '@/access'
import { CURRENCIES, SHIPPING_COUNTRIES } from '@/lib/constants'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: {
    read: anyone,
    update: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'siteName', type: 'text', required: true, defaultValue: 'Little Nest' },
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue: 'Soft, organic clothing for little ones',
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Default description for search engines and social sharing.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Optional. The shop name is shown when no logo is set.' },
                },
                {
                  name: 'defaultShareImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Used when a page has no SEO image. 1200 × 630 works best.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Shop & shipping',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'currency',
                  type: 'select',
                  required: true,
                  defaultValue: 'USD',
                  options: CURRENCIES.map(({ label, value }) => ({ label, value })),
                  admin: {
                    width: '50%',
                    description: 'Prices in the shop are in this currency.',
                  },
                },
                {
                  name: 'locale',
                  type: 'text',
                  defaultValue: 'en-US',
                  admin: {
                    width: '50%',
                    description: 'Used to format prices and dates, e.g. en-GB.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'shippingRate',
                  label: 'Standard shipping price',
                  type: 'number',
                  required: true,
                  defaultValue: 5.95,
                  min: 0,
                  admin: { step: 0.01, width: '50%' },
                },
                {
                  name: 'freeShippingThreshold',
                  label: 'Free shipping from',
                  type: 'number',
                  min: 0,
                  defaultValue: 75,
                  admin: {
                    step: 0.01,
                    width: '50%',
                    description: 'Order subtotal for free shipping. Leave empty to turn it off.',
                  },
                },
              ],
            },
            {
              name: 'deliveryEstimate',
              type: 'group',
              label: 'Delivery estimate (business days)',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'min', type: 'number', defaultValue: 2, min: 1 },
                    { name: 'max', type: 'number', defaultValue: 5, min: 1 },
                  ],
                },
              ],
            },
            {
              name: 'shippingCountries',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: ['US'],
              options: SHIPPING_COUNTRIES.map(({ label, value }) => ({ label, value })),
              admin: { description: 'Countries customers can choose at checkout.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'lowStockThreshold',
                  type: 'number',
                  defaultValue: 3,
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'Show “Only X left” at or below this number.',
                  },
                },
                {
                  name: 'allowPromotionCodes',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                    description:
                      'Let customers enter promotion codes created in Stripe at checkout.',
                  },
                },
              ],
            },
            {
              name: 'productPageNote',
              type: 'textarea',
              defaultValue: 'Free shipping on orders over $75 · Free 30-day returns',
              admin: { description: 'Short reassurance shown under the “Add to bag” button.' },
            },
          ],
        },
        {
          label: 'Contact & store',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', admin: { width: '50%' } },
                { name: 'phone', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'address',
              type: 'textarea',
              admin: { description: 'Shop address, shown on the contact page and in the footer.' },
            },
            {
              name: 'mapUrl',
              type: 'text',
              label: 'Map link',
              admin: { placeholder: 'https://maps.google.com/…' },
            },
            {
              name: 'openingHours',
              type: 'array',
              labels: { singular: 'Opening hours', plural: 'Opening hours' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'days',
                      type: 'text',
                      required: true,
                      admin: { placeholder: 'Mon – Fri' },
                    },
                    {
                      name: 'hours',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '10:00 – 18:00' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'social',
              type: 'array',
              labels: { singular: 'Social profile', plural: 'Social profiles' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'Pinterest', value: 'pinterest' },
                        { label: 'TikTok', value: 'tiktok' },
                        { label: 'YouTube', value: 'youtube' },
                      ],
                    },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Notifications',
          fields: [
            {
              name: 'notificationEmail',
              type: 'email',
              // Settings are public (the storefront reads them), but this address is for staff only.
              access: { read: ({ req }) => Boolean(req.user) },
              admin: {
                description:
                  'New orders and contact messages are sent here. Falls back to the contact email.',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidateTags(
          [CACHE_TAGS.global('settings'), CACHE_TAGS.products, CACHE_TAGS.sitemap],
          req,
        )
        return doc
      },
    ],
  },
}
