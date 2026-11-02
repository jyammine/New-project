import { ChevronDown } from 'lucide-react'

import { RichText } from '@/components/RichText'
import type { FaqBlock } from '@/payload-types'

export function Faq({ block }: { block: FaqBlock }) {
  return (
    <section className="container-page" aria-labelledby={`block-${block.id}`}>
      <div className="mx-auto max-w-3xl">
        <h2 id={`block-${block.id}`} className="mb-8 text-3xl sm:text-4xl">
          {block.heading}
        </h2>
        <div className="divide-y divide-line rounded-3xl bg-white px-6 shadow-[var(--shadow-soft)] sm:px-8">
          {(block.items ?? []).map((item) => (
            <details key={item.id ?? item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  className="size-5 shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="pt-3">
                <RichText data={item.answer} className="prose-base" />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
