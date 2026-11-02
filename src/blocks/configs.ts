import type { Block, SelectField } from 'payload'

import { linkField } from '@/fields/link'

const themeField: SelectField = {
  name: 'theme',
  type: 'select',
  defaultValue: 'blush',
  options: [
    { label: 'Blush', value: 'blush' },
    { label: 'Sage', value: 'sage' },
    { label: 'Sky', value: 'sky' },
    { label: 'Butter', value: 'butter' },
    { label: 'Cream', value: 'cream' },
  ],
}

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text', admin: { description: 'Small text above the heading.' } },
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'links',
      type: 'array',
      maxRows: 2,
      fields: [linkField({ withAppearance: true })],
    },
    { ...themeField },
  ],
}

export const FeaturedProductsBlock: Block = {
  slug: 'featuredProducts',
  interfaceName: 'FeaturedProductsBlock',
  labels: { singular: 'Product grid', plural: 'Product grids' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'featured',
      options: [
        { label: 'Products marked as featured', value: 'featured' },
        { label: 'Newest products', value: 'newest' },
        { label: 'From a category', value: 'category' },
        { label: 'Hand-picked products', value: 'manual' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { condition: (_, siblingData) => siblingData?.source === 'category' },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 12,
      admin: { condition: (_, siblingData) => siblingData?.source !== 'manual' },
    },
    linkField({ name: 'cta', label: 'Button', required: false }),
  ],
}

export const CategoryGridBlock: Block = {
  slug: 'categoryGrid',
  interfaceName: 'CategoryGridBlock',
  labels: { singular: 'Category tiles', plural: 'Category tiles' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { description: 'Leave empty to show all categories.' },
    },
  ],
}

export const ContentBlock: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [
    { name: 'content', type: 'richText', required: true },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'narrow',
      options: [
        { label: 'Narrow (best for reading)', value: 'narrow' },
        { label: 'Wide', value: 'wide' },
      ],
    },
  ],
}

export const MediaTextBlock: Block = {
  slug: 'mediaText',
  interfaceName: 'MediaTextBlock',
  labels: { singular: 'Image with text', plural: 'Images with text' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'content', type: 'richText' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image on the left', value: 'left' },
        { label: 'Image on the right', value: 'right' },
      ],
    },
    linkField({ name: 'cta', label: 'Button', required: false }),
    { ...themeField, defaultValue: 'cream' },
  ],
}

export const FeatureListBlock: Block = {
  slug: 'featureList',
  interfaceName: 'FeatureListBlock',
  labels: { singular: 'Highlights', plural: 'Highlights' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'leaf',
          options: [
            { label: 'Leaf', value: 'leaf' },
            { label: 'Truck', value: 'truck' },
            { label: 'Heart', value: 'heart' },
            { label: 'Gift', value: 'gift' },
            { label: 'Recycle', value: 'recycle' },
            { label: 'Shield', value: 'shield' },
            { label: 'Sparkles', value: 'sparkles' },
            { label: 'Baby', value: 'baby' },
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 9,
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'author', type: 'text', required: true },
        { name: 'detail', type: 'text', admin: { placeholder: 'Mum of two, Portland' } },
        { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5 },
      ],
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', required: true },
      ],
    },
  ],
}

export const CallToActionBlock: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    {
      name: 'links',
      type: 'array',
      maxRows: 2,
      fields: [linkField({ withAppearance: true })],
    },
    { ...themeField, defaultValue: 'sage' },
  ],
}

export const TableBlock: Block = {
  slug: 'table',
  interfaceName: 'TableBlock',
  labels: { singular: 'Table (e.g. size guide)', plural: 'Tables' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'caption', type: 'textarea' },
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      fields: [
        {
          name: 'cells',
          type: 'array',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
}

export const NewsletterBlock: Block = {
  slug: 'newsletter',
  interfaceName: 'NewsletterBlock',
  labels: { singular: 'Newsletter signup', plural: 'Newsletter signups' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'text', type: 'textarea' },
    {
      name: 'showStoreDetails',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show address, phone and opening hours from Site settings.' },
    },
  ],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  FeaturedProductsBlock,
  CategoryGridBlock,
  ContentBlock,
  MediaTextBlock,
  FeatureListBlock,
  TestimonialsBlock,
  FaqBlock,
  CallToActionBlock,
  TableBlock,
  NewsletterBlock,
  ContactBlock,
]
