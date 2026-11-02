import { describe, expect, it } from 'vitest'

import { escapeHtml, inquiryNotificationEmail, orderConfirmationEmail } from '@/emails/templates'
import { slugify } from '@/fields/slug'
import { resolveHref } from '@/lib/links'
import { formatMoney, fromMinorUnits, toMinorUnits } from '@/lib/money'

describe('money', () => {
  it('converts to and from minor units', () => {
    expect(toMinorUnits(19.99)).toBe(1999)
    expect(toMinorUnits(0.1 + 0.2)).toBe(30)
    expect(fromMinorUnits(1999)).toBe(19.99)
    expect(fromMinorUnits(null)).toBe(0)
  })
  it('formats currencies for a locale', () => {
    expect(formatMoney(22, 'USD', 'en-US')).toBe('$22.00')
    expect(formatMoney(22, 'EUR', 'de-DE')).toMatch(/22,00\s€/)
  })
  it('falls back gracefully on invalid input', () => {
    expect(formatMoney(Number.NaN, 'USD', 'en-US')).toBe('$0.00')
    expect(formatMoney(5, 'NOT-A-CURRENCY', 'en-US')).toBe('$5.00')
  })
})

describe('slugify', () => {
  it('creates URL-safe slugs', () => {
    expect(slugify('  Frill Sleeve Romper – Blush! ')).toBe('frill-sleeve-romper-blush')
    expect(slugify('Crème Brûlée')).toBe('creme-brulee')
  })
})

describe('resolveHref', () => {
  it('resolves references to CMS documents', () => {
    expect(
      resolveHref({
        type: 'reference',
        reference: { relationTo: 'pages', value: { slug: 'about' } },
      }),
    ).toBe('/about')
    expect(
      resolveHref({
        type: 'reference',
        reference: { relationTo: 'pages', value: { slug: 'home' } },
      }),
    ).toBe('/')
    expect(
      resolveHref({
        type: 'reference',
        reference: { relationTo: 'products', value: { slug: 'hat' } },
      }),
    ).toBe('/products/hat')
    expect(
      resolveHref({
        type: 'reference',
        reference: { relationTo: 'categories', value: { slug: 'knits' } },
      }),
    ).toBe('/shop/knits')
  })
  it('blocks unsafe custom URLs', () => {
    expect(resolveHref({ type: 'custom', url: 'javascript:alert(1)' })).toBeNull()
    expect(resolveHref({ type: 'custom', url: 'data:text/html,hi' })).toBeNull()
    expect(resolveHref({ type: 'custom', url: 'https://example.com' })).toBe('https://example.com')
    expect(resolveHref({ type: 'custom', url: 'mailto:hi@example.com' })).toBe(
      'mailto:hi@example.com',
    )
  })
  it('returns null for unpopulated references', () => {
    expect(
      resolveHref({ type: 'reference', reference: { relationTo: 'pages', value: 3 } }),
    ).toBeNull()
  })
})

describe('email templates', () => {
  const brand = {
    siteName: 'Little Nest',
    siteUrl: 'https://shop.test',
    locale: 'en-US',
    supportEmail: 'hi@shop.test',
  }

  it('escapes HTML', () => {
    expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;',
    )
  })

  it('renders an order confirmation without injecting customer input', () => {
    const { subject, html, text } = orderConfirmationEmail(
      {
        orderNumber: 'LN-1',
        customerName: '<img src=x onerror=alert(1)> Sam',
        currency: 'USD',
        subtotal: 44,
        shippingTotal: 0,
        total: 44,
        items: [{ title: 'Bodysuit', size: '0-3m', quantity: 2, unitPrice: 22 }],
      },
      brand,
    )
    expect(subject).toContain('LN-1')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('$44.00')
    expect(html).toContain('0–3 months')
    expect(text).toContain('2 × Bodysuit (0–3 months)')
  })

  it('escapes contact form messages', () => {
    const { html } = inquiryNotificationEmail(
      { name: 'A', email: 'a@b.c', subject: '<b>Hi</b>', message: '<script>bad()</script>' },
      brand,
    )
    expect(html).not.toContain('<script>bad()')
    expect(html).toContain('&lt;b&gt;Hi&lt;/b&gt;')
  })
})
