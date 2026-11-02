import { CmsImage } from '@/components/CmsImage'
import { CmsLink } from '@/components/CmsLink'
import { RichText } from '@/components/RichText'
import { cn } from '@/components/ui/cn'
import type { MediaTextBlock } from '@/payload-types'

import { themeClass } from './themes'

export function MediaText({ block }: { block: MediaTextBlock }) {
  const imageRight = block.imagePosition === 'right'
  return (
    <section className="container-page">
      <div
        className={cn(
          'grid overflow-hidden rounded-[2rem] md:grid-cols-2',
          themeClass(block.theme),
        )}
      >
        <div className={cn('relative min-h-72 md:min-h-[28rem]', imageRight && 'md:order-2')}>
          <CmsImage media={block.image} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div className="flex flex-col justify-center gap-5 px-6 py-12 sm:px-12 lg:px-16">
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          <h2 className="text-3xl sm:text-4xl">{block.heading}</h2>
          {block.content && <RichText data={block.content} className="prose-base" />}
          {block.cta?.label && (
            <div>
              <CmsLink link={{ ...block.cta, appearance: 'primary' }} asButton />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
