import type { Page } from '@/payload-types'

import { CallToAction } from './CallToAction'
import { CategoryGrid } from './CategoryGrid'
import { Contact } from './Contact'
import { Content } from './Content'
import { Faq } from './Faq'
import { FeaturedProducts } from './FeaturedProducts'
import { FeatureList } from './FeatureList'
import { Hero } from './Hero'
import { MediaText } from './MediaText'
import { Newsletter } from './Newsletter'
import { Table } from './Table'
import { Testimonials } from './Testimonials'

type LayoutBlock = NonNullable<Page['layout']>[number]

function renderBlock(block: LayoutBlock, index: number) {
  switch (block.blockType) {
    case 'hero':
      return <Hero block={block} isFirst={index === 0} />
    case 'featuredProducts':
      return <FeaturedProducts block={block} />
    case 'categoryGrid':
      return <CategoryGrid block={block} />
    case 'content':
      return <Content block={block} />
    case 'mediaText':
      return <MediaText block={block} />
    case 'featureList':
      return <FeatureList block={block} />
    case 'testimonials':
      return <Testimonials block={block} />
    case 'faq':
      return <Faq block={block} />
    case 'cta':
      return <CallToAction block={block} />
    case 'table':
      return <Table block={block} />
    case 'newsletter':
      return <Newsletter block={block} />
    case 'contact':
      return <Contact block={block} />
    default:
      return null
  }
}

export function RenderBlocks({ blocks }: { blocks: Page['layout'] }) {
  if (!blocks?.length) return null
  return (
    <div className="flex flex-col gap-16 pb-8 sm:gap-24">
      {blocks.map((block, index) => (
        <div key={block.id ?? index}>{renderBlock(block, index)}</div>
      ))}
    </div>
  )
}
