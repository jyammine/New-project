import type { Field, FieldHook } from 'payload'

export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim().length > 0) return slugify(value)
    const fallback = data?.[fallbackField] ?? originalDoc?.[fallbackField]
    if (typeof fallback === 'string' && fallback.length > 0) return slugify(fallback)
    return value
  }

/** URL slug, generated from another field when left empty. */
export const slugField = (fallbackField = 'title', overrides: Partial<Field> = {}): Field =>
  ({
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    required: true,
    label: 'URL slug',
    admin: {
      position: 'sidebar',
      description: 'Used in the page address. Leave empty to generate it from the title.',
    },
    hooks: {
      beforeValidate: [formatSlug(fallbackField)],
    },
    ...overrides,
  }) as Field
