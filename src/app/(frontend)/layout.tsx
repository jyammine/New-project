import '@fontsource-variable/fraunces/soft.css'
import '@fontsource-variable/nunito'
import './globals.css'

import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartProvider, type ShopConfig } from '@/components/cart/CartProvider'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { PreviewBar } from '@/components/layout/PreviewBar'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { mediaSrc } from '@/lib/media'
import { getSettings } from '@/lib/queries'
import { isCheckoutEnabled } from '@/lib/stripe'
import { getServerSideURL } from '@/lib/urls'

// Pages are rendered on request and backed by Next's data cache, which is invalidated
// from Payload hooks. This keeps CMS edits instant and lets the app build without a database.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const siteName = settings?.siteName || 'Little Nest'
  const shareImage = mediaSrc(settings?.defaultShareImage, 'og')
  return {
    metadataBase: new URL(getServerSideURL()),
    title: {
      default: settings?.tagline ? `${siteName} — ${settings.tagline}` : siteName,
      template: `%s | ${siteName}`,
    },
    description: settings?.description || settings?.tagline || undefined,
    applicationName: siteName,
    openGraph: {
      type: 'website',
      siteName,
      images: shareImage ? [{ url: shareImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#fbf7f2',
  width: 'device-width',
  initialScale: 1,
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, draft] = await Promise.all([getSettings(), draftMode()])
  const locale = settings?.locale || 'en-US'

  const shopConfig: ShopConfig = {
    currency: settings?.currency || 'USD',
    locale,
    shippingRate: settings?.shippingRate ?? 0,
    freeShippingThreshold: settings?.freeShippingThreshold ?? null,
    checkoutEnabled: isCheckoutEnabled(),
  }

  return (
    <html lang={locale.split('-')[0] || 'en'}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <CartProvider config={shopConfig}>
          {draft.isEnabled && <PreviewBar />}
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        {draft.isEnabled && <LivePreviewListener serverURL={getServerSideURL()} />}
      </body>
    </html>
  )
}
