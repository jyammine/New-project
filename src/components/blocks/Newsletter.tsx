import { NewsletterForm } from '@/components/forms/NewsletterForm'
import type { NewsletterBlock } from '@/payload-types'

export function Newsletter({ block }: { block: NewsletterBlock }) {
  return (
    <section className="container-page">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-sky px-6 py-12 text-center sm:px-12">
        <h2 className="text-3xl sm:text-4xl">{block.heading}</h2>
        {block.text && <p className="mx-auto mt-3 max-w-lg text-ink-soft">{block.text}</p>}
        <NewsletterForm source="page" className="mx-auto mt-8 max-w-lg text-left" />
      </div>
    </section>
  )
}
