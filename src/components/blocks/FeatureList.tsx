import { Baby, Gift, Heart, Leaf, Recycle, ShieldCheck, Sparkles, Truck } from 'lucide-react'

import type { FeatureListBlock } from '@/payload-types'

const icons = {
  leaf: Leaf,
  truck: Truck,
  heart: Heart,
  gift: Gift,
  recycle: Recycle,
  shield: ShieldCheck,
  sparkles: Sparkles,
  baby: Baby,
} as const

const iconBg = ['bg-sage', 'bg-blush', 'bg-sky', 'bg-butter']

export function FeatureList({ block }: { block: FeatureListBlock }) {
  return (
    <section className="container-page">
      {block.heading && <h2 className="mb-8 text-center text-3xl sm:text-4xl">{block.heading}</h2>}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(block.items ?? []).map((item, index) => {
          const Icon = icons[(item.icon ?? 'leaf') as keyof typeof icons] ?? Leaf
          return (
            <li
              key={item.id ?? item.title}
              className="flex gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconBg[index % iconBg.length]}`}
              >
                <Icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-sans text-base font-extrabold tracking-normal">{item.title}</h3>
                {item.text && <p className="mt-1 text-sm text-ink-soft">{item.text}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
