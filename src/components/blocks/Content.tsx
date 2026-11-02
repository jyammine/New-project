import { RichText } from '@/components/RichText'
import { cn } from '@/components/ui/cn'
import type { ContentBlock } from '@/payload-types'

export function Content({ block }: { block: ContentBlock }) {
  return (
    <section className="container-page">
      <div className={cn('mx-auto', block.width === 'wide' ? 'max-w-5xl' : 'max-w-3xl')}>
        <RichText data={block.content} />
      </div>
    </section>
  )
}
