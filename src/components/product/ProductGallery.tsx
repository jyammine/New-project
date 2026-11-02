'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/components/ui/cn'

export type GalleryImage = {
  src: string
  alt: string
  width: number
  height: number
  position?: string
}

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]
  if (!current) {
    return <div className="aspect-[4/5] rounded-[2rem] bg-sand" aria-hidden />
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:self-start">
      <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-[2rem] bg-sand">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || title}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="animate-fade-in object-cover"
          style={current.position ? { objectPosition: current.position } : undefined}
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col" aria-label="Product images">
          {images.map((image, index) => (
            <li key={image.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  'relative block size-20 overflow-hidden rounded-2xl bg-sand ring-2 ring-offset-2 ring-offset-cream transition',
                  index === active ? 'ring-ink' : 'ring-transparent hover:ring-line',
                )}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === active}
              >
                <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
