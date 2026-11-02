import Image from 'next/image'

import { cn } from '@/components/ui/cn'
import { isMedia, type MaybeMedia, normalizeMediaUrl } from '@/lib/media'

type Props = {
  media: MaybeMedia
  /** Fill the parent (which must be positioned) instead of using intrinsic size. */
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  alt?: string
}

export function CmsImage({ media, fill = true, sizes = '100vw', priority, className, alt }: Props) {
  if (!isMedia(media)) return null
  const src = normalizeMediaUrl(media.url)
  if (!src) return null

  const focal =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? `${media.focalX}% ${media.focalY}%`
      : undefined

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt ?? media.alt ?? ''}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', className)}
        style={focal ? { objectPosition: focal } : undefined}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt ?? media.alt ?? ''}
      width={media.width ?? 1200}
      height={media.height ?? 1200}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
