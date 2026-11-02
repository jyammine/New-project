import type { Field, GroupField } from 'payload'

type LinkOptions = {
  name?: string
  label?: string
  required?: boolean
  withAppearance?: boolean
}

/** A reusable link: either a reference to CMS content or a custom URL. */
export const linkField = ({
  name = 'link',
  label = 'Link',
  required = true,
  withAppearance = false,
}: LinkOptions = {}): GroupField => {
  const fields: Field[] = [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Page, product or category', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open in new tab',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reference',
          type: 'relationship',
          relationTo: ['pages', 'products', 'categories'],
          required,
          maxDepth: 1,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.type !== 'custom',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required,
          admin: {
            width: '50%',
            placeholder: '/shop or https://…',
            condition: (_, siblingData) => siblingData?.type === 'custom',
          },
        },
        {
          name: 'label',
          type: 'text',
          required,
          admin: { width: '50%' },
        },
      ],
    },
  ]

  if (withAppearance) {
    fields.push({
      name: 'appearance',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Primary button', value: 'primary' },
        { label: 'Secondary button', value: 'secondary' },
        { label: 'Text link', value: 'link' },
      ],
    })
  }

  return {
    name,
    label,
    type: 'group',
    admin: { hideGutter: true },
    fields,
  }
}
