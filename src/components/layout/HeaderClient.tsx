'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/components/ui/cn'

export type NavItem = { href: string; label: string; newTab: boolean }

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  if (!items.length) return null
  return (
    <nav aria-label="Main" className="mx-auto hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              aria-current={isActive(pathname, item.href) ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold transition-colors hover:bg-sand',
                isActive(pathname, item.href) && 'bg-sand',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function MobileMenu({ items, siteName }: { items: NavItem[]; siteName: string }) {
  const pathname = usePathname()
  // Remember which page the menu was opened on so it closes itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenOn(null)
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="-ml-2 flex size-11 items-center justify-center rounded-full hover:bg-sand"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-6" aria-hidden />
      </button>
      {/* Portalled to <body>: the sticky header's backdrop-filter would otherwise trap `position: fixed`. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50" role="presentation">
            <div
              className="animate-fade-in absolute inset-0 bg-ink/40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={`${siteName} menu`}
              className="animate-fade-in absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-cream p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl">{siteName}</span>
                <button
                  type="button"
                  className="-mr-2 flex size-11 items-center justify-center rounded-full hover:bg-sand"
                  aria-label="Close menu"
                  autoFocus
                  onClick={() => setOpen(false)}
                >
                  <X className="size-6" aria-hidden />
                </button>
              </div>
              <nav aria-label="Mobile" className="mt-8">
                <ul className="flex flex-col gap-1">
                  {[
                    { href: '/shop', label: 'Shop all', newTab: false },
                    ...items.filter((i) => i.href !== '/shop'),
                  ].map((item) => (
                    <li key={`${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        target={item.newTab ? '_blank' : undefined}
                        aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                        className="block rounded-2xl px-4 py-3 font-display text-xl hover:bg-sand"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
