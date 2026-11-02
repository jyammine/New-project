import Link from 'next/link'

import { CmsImage } from '@/components/CmsImage'
import { getCategories } from '@/lib/queries'
import { categoryPath } from '@/lib/urls'
import type { Category, CategoryGridBlock } from '@/payload-types'

const tileColors = ['bg-blush', 'bg-sage', 'bg-sky', 'bg-butter']

export async function CategoryGrid({ block }: { block: CategoryGridBlock }) {
  const picked = (block.categories ?? []).filter(
    (c): c is Category => typeof c === 'object' && c !== null,
  )
  const categories = picked.length ? picked : await getCategories()
  if (!categories.length) return null

  return (
    <section className="container-page" aria-labelledby={`block-${block.id}`}>
      <h2 id={`block-${block.id}`} className="mb-8 text-3xl sm:text-4xl">
        {block.heading}
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((category, index) => (
          <li key={category.id}>
            <Link
              href={categoryPath(category)}
              className={`group relative flex aspect-square flex-col justify-end overflow-hidden rounded-[var(--radius-card)] p-5 ${tileColors[index % tileColors.length]}`}
            >
              {category.image && (
                <CmsImage
                  media={category.image}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span className="relative z-10 inline-flex w-fit items-center rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold shadow-sm backdrop-blur">
                {category.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
