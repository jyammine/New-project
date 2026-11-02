import type { CollectionConfig } from 'payload'

import { publishedOrStaff, staff } from '@/access'
import { pageBlocks } from '@/blocks/configs'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { CACHE_TAGS, revalidateTags } from '@/lib/revalidate'
import { pagePath, previewUrl } from '@/lib/urls'

const RESERVED_SLUGS = ['shop', 'products', 'cart', 'checkout', 'search', 'admin', 'api', 'next']

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'The page with the slug “home” is used as the home page.',
    livePreview: {
      url: ({ data }) => previewUrl(pagePath(data as { slug?: string })),
    },
    preview: (doc) => previewUrl(pagePath(doc as { slug?: string })),
  },
  access: {
    read: publishedOrStaff,
    create: staff,
    update: staff,
    delete: staff,
  },
  versions: {
    drafts: {
      autosave: { interval: 400 },
    },
    maxPerDoc: 30,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
              admin: { initCollapsed: true },
            },
          ],
        },
        seoTab,
      ],
    },
    slugField('title', {
      validate: (value: string | null | undefined) =>
        value && RESERVED_SLUGS.includes(value)
          ? `“${value}” is reserved by the shop. Please choose another slug.`
          : true,
    }),
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc, req }) => {
        const tags: string[] = [CACHE_TAGS.pages, CACHE_TAGS.page(doc.slug), CACHE_TAGS.sitemap]
        if (previousDoc?.slug && previousDoc.slug !== doc.slug)
          tags.push(CACHE_TAGS.page(previousDoc.slug))
        revalidateTags(tags, req)
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        revalidateTags([CACHE_TAGS.pages, CACHE_TAGS.page(doc.slug), CACHE_TAGS.sitemap], req)
        return doc
      },
    ],
  },
}
