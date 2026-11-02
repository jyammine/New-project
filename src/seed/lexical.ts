/** Tiny helpers to build Lexical rich text JSON for seed content. */

type Node = { type: string; version: number; [k: string]: unknown }

const text = (value: string, format = 0): Node => ({
  type: 'text',
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

type Inline = string | Node

const inline = (children: Inline[]): Node[] =>
  children.map((c) => (typeof c === 'string' ? text(c) : c))

export const bold = (value: string): Node => text(value, 1)

export const link = (label: string, url: string): Node => ({
  type: 'link',
  version: 3,
  direction: 'ltr',
  format: '',
  indent: 0,
  fields: { linkType: 'custom', url, newTab: false },
  children: [text(label)],
})

export const p = (...children: Inline[]): Node => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: inline(children),
})

export const h = (tag: 'h2' | 'h3' | 'h4', value: string): Node => ({
  type: 'heading',
  tag,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [text(value)],
})

export const ul = (...items: Inline[][]): Node => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: items.map((item, index) => ({
    type: 'listitem',
    value: index + 1,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: inline(item),
  })),
})

export const richText = (...children: Node[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children,
  },
})
