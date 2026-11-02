import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import { cn } from '@/components/ui/cn'
import { isMedia, type MaybeMedia, normalizeMediaUrl } from '@/lib/media'
import type { Media } from '@/payload-types'
import { docPath } from '@/lib/urls'

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc
      if (!doc || typeof doc.value !== 'object') return '#'
      return docPath(doc.relationTo, doc.value as { slug?: string })
    },
  }),
  link: (args) => {
    const { node, nodesToJSX } = args
    const fields = node.fields
    let href = fields.url ?? '#'
    if (fields.linkType === 'internal' && fields.doc && typeof fields.doc.value === 'object') {
      href = docPath(fields.doc.relationTo, fields.doc.value as { slug?: string })
    } else if (!SAFE_URL.test(href)) {
      href = '#'
    }
    return (
      <a
        href={href}
        target={fields.newTab ? '_blank' : undefined}
        rel={fields.newTab ? 'noopener noreferrer' : undefined}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    )
  },
  upload: ({ node }) => {
    const value = node.value
    if (typeof value !== 'object' || !isMedia(value as MaybeMedia)) return null
    const media = value as Media
    const src = normalizeMediaUrl(media.url)
    if (!src || !media.mimeType?.startsWith('image')) return null
    return (
      <Image
        src={src}
        alt={media.alt ?? ''}
        width={media.width ?? 1200}
        height={media.height ?? 800}
        sizes="(min-width: 1024px) 720px, 100vw"
        className="h-auto w-full"
      />
    )
  },
})

type Props = {
  data: SerializedEditorState | Record<string, unknown> | null | undefined
  className?: string
  prose?: boolean
}

export function RichText({ data, className, prose = true }: Props) {
  if (!data) return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters}
      className={cn(prose && 'prose-shop', className)}
    />
  )
}
