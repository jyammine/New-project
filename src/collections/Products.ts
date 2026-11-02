import type { CollectionConfig, Field } from 'payload'

import { activeProductsOrStaff, staff } from '@/access'
import { seoTab } from '@/fields/seo'
import { slugField, slugify } from '@/fields/slug'
import { SIZES } from '@/lib/constants'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'
import { previewUrl, productPath } from '@/lib/urls'

const variantFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'size',
        type: 'select',
        required: true,
        options: SIZES.map(({ label, value }) => ({ label, value })),
        admin: { width: '34%' },
      },
      {
        name: 'sku',
        label: 'SKU',
        type: 'text',
        admin: { width: '33%', description: 'Generated automatically if left empty.' },
      },
      {
        name: 'stock',
        type: 'number',
        required: true,
        defaultValue: 0,
        min: 0,
        admin: { width: '33%', step: 1 },
        validate: (value: number | null | undefined) =>
          value === null || value === undefined || Number.isInteger(value)
            ? true
            : 'Stock must be a whole number.',
      },
    ],
  },
]

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'status', 'categories', 'updatedAt'],
    group: 'Shop',
    listSearchableFields: ['title', 'slug', 'variants.sku'],
    preview: (doc) => previewUrl(productPath(doc as { slug?: string })),
  },
  defaultSort: '-createdAt',
  access: {
    read: activeProductsOrStaff,
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Product',
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              required: true,
              minRows: 1,
              maxRows: 12,
              admin: { description: 'The first image is used on product cards.' },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              maxLength: 240,
              admin: { description: 'One or two sentences shown near the price.' },
            },
            { name: 'description', type: 'richText' },
          ],
        },
        {
          label: 'Price & stock',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    step: 0.01,
                    width: '50%',
                    description:
                      'Selling price shown in the shop (see STRIPE_TAX_BEHAVIOR for tax handling).',
                  },
                },
                {
                  name: 'compareAtPrice',
                  label: 'Compare-at price',
                  type: 'number',
                  min: 0,
                  admin: {
                    step: 0.01,
                    width: '50%',
                    description: 'Optional original price. Shows the product as on sale.',
                  },
                  validate: (
                    value: number | null | undefined,
                    { siblingData }: { siblingData: { price?: number } },
                  ) => {
                    if (value === null || value === undefined) return true
                    if (typeof siblingData?.price === 'number' && value <= siblingData.price) {
                      return 'Compare-at price must be higher than the price.'
                    }
                    return true
                  },
                },
              ],
            },
            {
              name: 'variants',
              label: 'Sizes',
              type: 'array',
              required: true,
              minRows: 1,
              labels: { singular: 'Size', plural: 'Sizes' },
              admin: {
                initCollapsed: false,
                components: {
                  RowLabel: '@/components/admin/VariantRowLabel#VariantRowLabel',
                },
              },
              validate: (value: unknown) => {
                if (!Array.isArray(value)) return true
                const sizes = value.map((row: { size?: string }) => row?.size).filter(Boolean)
                return new Set(sizes).size === sizes.length
                  ? true
                  : 'Each size can only be listed once.'
              },
              fields: variantFields,
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'color', type: 'text', admin: { width: '50%' } },
                {
                  name: 'material',
                  type: 'text',
                  admin: { width: '50%', placeholder: '100% organic cotton' },
                },
              ],
            },
            {
              name: 'features',
              type: 'array',
              labels: { singular: 'Feature', plural: 'Features' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'careInstructions',
              type: 'textarea',
              admin: { placeholder: 'Machine wash at 30°C. Tumble dry low.' },
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Active (visible in the shop)', value: 'active' },
        { label: 'Draft (hidden)', value: 'draft' },
        { label: 'Archived (hidden)', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Bestseller', value: 'bestseller' },
        { label: 'Limited edition', value: 'limited' },
        { label: 'Organic', value: 'organic' },
      ],
      admin: { position: 'sidebar', description: 'Optional label on product cards.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Show in “featured products” sections.' },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 8,
      admin: { position: 'sidebar' },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || !Array.isArray(data.variants)) return data
        const base = slugify(String(data.slug || data.title || 'item')).toUpperCase()
        data.variants = data.variants.map((variant: { sku?: string | null; size?: string }) => ({
          ...variant,
          sku: variant?.sku?.trim() || `${base}-${String(variant?.size ?? '').toUpperCase()}`,
        }))
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc, req }) => {
        const tags: string[] = [
          CACHE_TAGS.products,
          CACHE_TAGS.product(doc.slug),
          CACHE_TAGS.sitemap,
        ]
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          tags.push(CACHE_TAGS.product(previousDoc.slug))
        }
        revalidateTags(tags, req)
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        revalidateTags([CACHE_TAGS.products, CACHE_TAGS.product(doc.slug), CACHE_TAGS.sitemap], req)
        return doc
      },
    ],
  },
}
