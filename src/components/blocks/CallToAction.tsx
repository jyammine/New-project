import { CmsLink } from '@/components/CmsLink'
import { cn } from '@/components/ui/cn'
import type { CallToActionBlock } from '@/payload-types'

import { themeClass } from './themes'

export function CallToAction({ block }: { block: CallToActionBlock }) {
  return (
    <section className="container-page">
      <div
        className={cn('rounded-[2rem] px-6 py-14 text-center sm:px-12', themeClass(block.theme))}
      >
        <h2 className="mx-auto max-w-2xl text-3xl sm:text-4xl">{block.heading}</h2>
        {block.text && <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">{block.text}</p>}
        {block.links && block.links.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {block.links.map((item) => (
              <CmsLink key={item.id ?? item.link.label} link={item.link} asButton />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
