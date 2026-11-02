import { CmsImage } from '@/components/CmsImage'
import type { Media } from '@/payload-types'

export function NestMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <circle cx="24" cy="24" r="24" fill="var(--color-blush)" />
      <path
        d="M11 27c3 7 8.5 10 13 10s10-3 13-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M14 27h20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <ellipse
        cx="20"
        cy="22"
        rx="4"
        ry="5"
        fill="var(--color-cream)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <ellipse
        cx="28.5"
        cy="21"
        rx="4"
        ry="5"
        fill="var(--color-cream)"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export function Logo({ name, logo }: { name: string; logo?: Media | number | null }) {
  if (logo && typeof logo === 'object') {
    return (
      <span className="relative block h-10 w-36">
        <CmsImage
          media={logo}
          sizes="144px"
          className="object-contain object-left"
          alt={name}
          priority
        />
      </span>
    )
  }
  return (
    <span className="flex items-center gap-2.5">
      <NestMark />
      <span className="font-display text-2xl leading-none tracking-tight">{name}</span>
    </span>
  )
}
