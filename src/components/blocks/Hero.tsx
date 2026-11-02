import { CmsImage } from '@/components/CmsImage'
import { CmsLink } from '@/components/CmsLink'
import { cn } from '@/components/ui/cn'
import type { HeroBlock } from '@/payload-types'

import { themeClass } from './themes'

export function Hero({ block, isFirst }: { block: HeroBlock; isFirst: boolean }) {
  const HeadingTag = isFirst ? 'h1' : 'h2'
  return (
    <section className="container-page pt-4 sm:pt-6">
      <div
        className={cn(
          'grid overflow-hidden rounded-[2rem] md:grid-cols-2 md:items-stretch',
          themeClass(block.theme),
        )}
      >
        <div className="flex flex-col justify-center gap-6 px-6 py-12 sm:px-12 md:py-20 lg:px-16">
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          <HeadingTag className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            {block.heading}
          </HeadingTag>
          {block.text && <p className="max-w-md text-lg text-ink-soft">{block.text}</p>}
          {block.links && block.links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {block.links.map((item) => (
                <CmsLink key={item.id ?? item.link.label} link={item.link} asButton />
              ))}
            </div>
          )}
        </div>
        {block.image && (
          <div className="relative min-h-72 md:min-h-[32rem]">
            <CmsImage
              media={block.image}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={isFirst}
            />
          </div>
        )}
      </div>
    </section>
  )
}
