import { Star } from 'lucide-react'

import type { TestimonialsBlock } from '@/payload-types'

export function Testimonials({ block }: { block: TestimonialsBlock }) {
  return (
    <section className="container-page" aria-labelledby={`block-${block.id}`}>
      <h2 id={`block-${block.id}`} className="mb-8 text-center text-3xl sm:text-4xl">
        {block.heading}
      </h2>
      <ul className="grid gap-6 md:grid-cols-3">
        {(block.items ?? []).map((item) => (
          <li key={item.id ?? item.author}>
            <figure className="flex h-full flex-col gap-4 rounded-3xl bg-white p-8 shadow-[var(--shadow-soft)]">
              {item.rating ? (
                <div
                  className="flex gap-0.5 text-butter-strong"
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="size-4"
                      fill={i < (item.rating ?? 0) ? 'currentColor' : 'none'}
                      aria-hidden
                    />
                  ))}
                </div>
              ) : null}
              <blockquote className="font-display text-xl leading-snug text-ink">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-auto text-sm">
                <span className="font-extrabold">{item.author}</span>
                {item.detail && <span className="text-ink-soft"> · {item.detail}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
