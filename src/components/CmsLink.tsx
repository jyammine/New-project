import Link from 'next/link'

import { cn } from '@/components/ui/cn'
import { type LinkData, resolveHref } from '@/lib/links'

export { type LinkData, resolveHref }

type Props = {
  link: LinkData | null | undefined
  className?: string
  children?: React.ReactNode
  /** Render with button styles based on `link.appearance`. */
  asButton?: boolean
}

export function CmsLink({ link, className, children, asButton }: Props) {
  const href = resolveHref(link)
  if (!href || !link) return null
  const appearance = link.appearance ?? 'primary'
  const classes = cn(
    asButton && 'btn',
    asButton && appearance === 'primary' && 'btn-primary',
    asButton && appearance === 'secondary' && 'btn-secondary',
    asButton && appearance === 'link' && 'btn-link',
    className,
  )
  const content = children ?? link.label
  const external = /^https?:\/\//i.test(href)

  if (link.newTab || external) {
    return (
      <a
        href={href}
        className={classes}
        target={link.newTab ? '_blank' : undefined}
        rel={link.newTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}
