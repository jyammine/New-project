import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access'
import { slugField } from '@/fields/slug'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'sortOrder', 'updatedAt'],
    group: 'Shop',
    listSearchableFields: ['title', 'slug'],
  },
  defaultSort: 'sortOrder',
  access: {
    read: anyone,
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Shown at the top of the category page and in search results.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used on category tiles on the home page.' },
    },
    slugField(),
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers are shown first.' },
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc, req }) => {
        revalidateTags(
          [
            CACHE_TAGS.categories,
            CACHE_TAGS.products,
            CACHE_TAGS.sitemap,
            CACHE_TAGS.global('header'),
          ],
          req,
        )
        if (previousDoc?.slug && previousDoc.slug !== doc.slug)
          revalidateTags([CACHE_TAGS.categories], req)
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        revalidateTags([CACHE_TAGS.categories, CACHE_TAGS.products, CACHE_TAGS.sitemap], req)
        return doc
      },
    ],
  },
}
