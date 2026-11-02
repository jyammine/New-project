import Link from 'next/link'

import { CartButton } from '@/components/cart/CartButton'
import { resolveHref } from '@/lib/links'
import { getHeader, getSettings } from '@/lib/queries'

import { HeaderNav, MobileMenu, type NavItem } from './HeaderClient'
import { Logo } from './Logo'

export async function Header() {
  const [header, settings] = await Promise.all([getHeader(), getSettings()])
  const siteName = settings?.siteName || 'Little Nest'

  const navItems: NavItem[] = (header?.navItems ?? [])
    .map((item) => ({
      href: resolveHref(item.link),
      label: item.link.label,
      newTab: Boolean(item.link.newTab),
    }))
    .filter((item): item is NavItem => Boolean(item.href && item.label))

  const announcement =
    header?.announcement?.enabled && header.announcement.text ? header.announcement : null

  return (
    <>
      {announcement && (
        <div className="bg-sage-strong text-center text-sm font-semibold text-white">
          <div className="container-page py-2">
            {announcement.url ? (
              <Link href={announcement.url} className="underline-offset-4 hover:underline">
                {announcement.text}
              </Link>
            ) : (
              announcement.text
            )}
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
        <div className="container-page flex h-16 items-center gap-4 lg:h-20">
          <MobileMenu items={navItems} siteName={siteName} />
          <Link href="/" className="shrink-0" aria-label={`${siteName} – home`}>
            <Logo name={siteName} logo={settings?.logo} />
          </Link>
          <HeaderNav items={navItems} />
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/shop"
              className="hidden min-h-11 items-center rounded-full px-4 text-sm font-bold hover:bg-sand sm:flex lg:hidden"
            >
              Shop
            </Link>
            <SearchButton />
            <CartButton />
          </div>
        </div>
      </header>
    </>
  )
}

function SearchButton() {
  return (
    <Link
      href="/shop?focus=search"
      className="flex size-11 items-center justify-center rounded-full hover:bg-sand"
      aria-label="Search products"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    </Link>
  )
}
