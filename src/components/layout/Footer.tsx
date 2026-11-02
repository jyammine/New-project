import Link from 'next/link'

import { CmsLink } from '@/components/CmsLink'
import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { getFooter, getSettings } from '@/lib/queries'

import { Logo } from './Logo'
import { SocialIcon } from './SocialIcon'

export async function Footer() {
  const [footer, settings] = await Promise.all([getFooter(), getSettings()])
  const siteName = settings?.siteName || 'Little Nest'
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-line bg-sand">
      {footer?.newsletter?.enabled && (
        <section className="border-b border-line" aria-labelledby="footer-newsletter">
          <div className="container-page grid gap-6 py-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 id="footer-newsletter" className="text-3xl">
                {footer.newsletter.heading}
              </h2>
              {footer.newsletter.text && (
                <p className="mt-2 text-ink-soft">{footer.newsletter.text}</p>
              )}
            </div>
            <NewsletterForm source="footer" />
          </div>
        </section>
      )}
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/" aria-label={`${siteName} – home`} className="inline-block">
            <Logo name={siteName} logo={settings?.logo} />
          </Link>
          {footer?.blurb && <p className="mt-4 max-w-xs text-sm text-ink-soft">{footer.blurb}</p>}
          {settings?.social && settings.social.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Social media">
              {settings.social.map((profile) => (
                <li key={profile.id ?? profile.url}>
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-10 items-center justify-center rounded-full bg-white text-ink hover:bg-blush"
                    aria-label={profile.platform}
                  >
                    <SocialIcon platform={profile.platform} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:grid-cols-4">
          {(footer?.columns ?? []).map((column) => (
            <nav key={column.id ?? column.title} aria-label={column.title}>
              <h2 className="font-sans text-sm font-extrabold tracking-wide">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {(column.links ?? []).map((item) => (
                  <li key={item.id ?? item.link.label}>
                    <CmsLink
                      link={item.link}
                      className="text-sm text-ink-soft hover:text-ink hover:underline"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {(settings?.address || settings?.email || settings?.phone) && (
            <div>
              <h2 className="font-sans text-sm font-extrabold tracking-wide">
                Visit &amp; contact
              </h2>
              <address className="mt-4 flex flex-col gap-2.5 text-sm text-ink-soft not-italic">
                {settings.address && (
                  <span className="whitespace-pre-line">{settings.address}</span>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="hover:text-ink hover:underline">
                    {settings.email}
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                    className="hover:text-ink hover:underline"
                  >
                    {settings.phone}
                  </a>
                )}
              </address>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-soft sm:flex-row sm:justify-between">
          <p>
            © {year} {siteName}. {footer?.legalText}
          </p>
          <p>Secure payments by Stripe</p>
        </div>
      </div>
    </footer>
  )
}
