import { sizeLabel } from '@/lib/constants'
import { formatMoney } from '@/lib/money'

export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export type EmailOrder = {
  orderNumber: string
  customerName?: string | null
  email?: string | null
  currency: string
  subtotal: number
  shippingTotal?: number | null
  taxTotal?: number | null
  discountTotal?: number | null
  total: number
  items: Array<{ title: string; size?: string | null; quantity: number; unitPrice: number }>
  shippingAddress?: {
    name?: string | null
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  } | null
  trackingCarrier?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
}

export type EmailBrand = {
  siteName: string
  siteUrl: string
  locale: string
  supportEmail?: string | null
}

const layout = (brand: EmailBrand, title: string, body: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf7f2;font-family:Helvetica,Arial,sans-serif;color:#2f2a35;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;">
            <tr>
              <td style="font-family:Georgia,serif;font-size:24px;color:#2f2a35;padding-bottom:24px;">
                <a href="${escapeHtml(brand.siteUrl)}" style="color:#2f2a35;text-decoration:none;">${escapeHtml(brand.siteName)}</a>
              </td>
            </tr>
            <tr><td>${body}</td></tr>
            <tr>
              <td style="padding-top:32px;font-size:12px;color:#7a7280;line-height:1.5;">
                ${brand.supportEmail ? `Questions? Reply to this email or write to <a href="mailto:${escapeHtml(brand.supportEmail)}" style="color:#7a7280;">${escapeHtml(brand.supportEmail)}</a>.<br />` : ''}
                &copy; ${new Date().getFullYear()} ${escapeHtml(brand.siteName)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

const itemsTable = (order: EmailOrder, locale: string): string => {
  const money = (value: number | null | undefined) =>
    escapeHtml(formatMoney(value ?? 0, order.currency, locale))
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e9e1;font-size:14px;">
          ${escapeHtml(item.title)}${item.size ? ` <span style="color:#7a7280;">· ${escapeHtml(sizeLabel(item.size))}</span>` : ''}
          <span style="color:#7a7280;"> × ${escapeHtml(item.quantity)}</span>
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #f0e9e1;font-size:14px;">${money(item.unitPrice * item.quantity)}</td>
      </tr>`,
    )
    .join('')
  const summaryRow = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;font-size:14px;${bold ? 'font-weight:bold;' : 'color:#5d5563;'}">${label}</td><td align="right" style="padding:4px 0;font-size:14px;${bold ? 'font-weight:bold;' : ''}">${value}</td></tr>`

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    ${rows}
    ${summaryRow('Subtotal', money(order.subtotal))}
    ${order.discountTotal ? summaryRow('Discount', `−${money(order.discountTotal)}`) : ''}
    ${summaryRow('Shipping', order.shippingTotal ? money(order.shippingTotal) : 'Free')}
    ${order.taxTotal ? summaryRow('Tax', money(order.taxTotal)) : ''}
    ${summaryRow('Total', money(order.total), true)}
  </table>`
}

const addressBlock = (order: EmailOrder): string => {
  const a = order.shippingAddress
  if (!a?.line1) return ''
  const lines = [
    a.name,
    a.line1,
    a.line2,
    [a.postalCode, a.city].filter(Boolean).join(' '),
    a.state,
    a.country,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join('<br />')
  return `<p style="font-size:14px;line-height:1.6;margin:16px 0 0;"><strong>Shipping to</strong><br />${lines}</p>`
}

export function orderConfirmationEmail(order: EmailOrder, brand: EmailBrand) {
  const firstName = order.customerName?.split(' ')[0]
  const subject = `Thank you for your order ${order.orderNumber}`
  const html = layout(
    brand,
    subject,
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 12px;">Thank you${firstName ? `, ${escapeHtml(firstName)}` : ''}!</h1>
     <p style="font-size:15px;line-height:1.6;margin:0;">We've received your order <strong>${escapeHtml(order.orderNumber)}</strong> and are getting it ready with care. We'll email you again as soon as it ships.</p>
     ${itemsTable(order, brand.locale)}
     ${addressBlock(order)}`,
  )
  const text = [
    `Thank you for your order ${order.orderNumber}.`,
    '',
    ...order.items.map(
      (i) => `${i.quantity} × ${i.title}${i.size ? ` (${sizeLabel(i.size)})` : ''}`,
    ),
    '',
    `Total: ${formatMoney(order.total, order.currency, brand.locale)}`,
    '',
    `We'll email you again when your order ships.`,
    brand.siteUrl,
  ].join('\n')
  return { subject, html, text }
}

export function orderShippedEmail(order: EmailOrder, brand: EmailBrand) {
  const subject = `Your order ${order.orderNumber} is on its way`
  const tracking = order.trackingNumber
    ? `<p style="font-size:15px;line-height:1.6;">${escapeHtml(order.trackingCarrier || 'Tracking number')}: <strong>${escapeHtml(order.trackingNumber)}</strong>${
        order.trackingUrl && /^https?:\/\//i.test(order.trackingUrl)
          ? `<br /><a href="${escapeHtml(order.trackingUrl)}" style="color:#4f6f52;">Track your parcel</a>`
          : ''
      }</p>`
    : ''
  const html = layout(
    brand,
    subject,
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 12px;">Good news — it's on its way!</h1>
     <p style="font-size:15px;line-height:1.6;margin:0;">Your order <strong>${escapeHtml(order.orderNumber)}</strong> has left our studio.</p>
     ${tracking}
     ${itemsTable(order, brand.locale)}
     ${addressBlock(order)}`,
  )
  const text = [
    `Your order ${order.orderNumber} is on its way.`,
    order.trackingNumber ? `${order.trackingCarrier || 'Tracking'}: ${order.trackingNumber}` : '',
    order.trackingUrl || '',
    brand.siteUrl,
  ]
    .filter(Boolean)
    .join('\n')
  return { subject, html, text }
}

export function newOrderNotificationEmail(order: EmailOrder, brand: EmailBrand, adminUrl: string) {
  const subject = `New order ${order.orderNumber} — ${formatMoney(order.total, order.currency, brand.locale)}`
  const html = layout(
    brand,
    subject,
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 12px;">New order ${escapeHtml(order.orderNumber)}</h1>
     <p style="font-size:15px;line-height:1.6;margin:0;">${escapeHtml(order.customerName || 'A customer')} (${escapeHtml(order.email || 'no email')}) just placed an order.</p>
     ${itemsTable(order, brand.locale)}
     ${addressBlock(order)}
     <p style="margin-top:24px;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#2f2a35;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px;">Open order in the admin</a></p>`,
  )
  return { subject, html, text: `${subject}\n${adminUrl}` }
}

export function inquiryNotificationEmail(
  inquiry: { name: string; email: string; subject: string; message: string },
  brand: EmailBrand,
) {
  const subject = `New message: ${inquiry.subject}`
  const html = layout(
    brand,
    subject,
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 12px;">${escapeHtml(inquiry.subject)}</h1>
     <p style="font-size:14px;color:#5d5563;margin:0 0 16px;">From ${escapeHtml(inquiry.name)} &lt;${escapeHtml(inquiry.email)}&gt;</p>
     <p style="font-size:15px;line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(inquiry.message)}</p>`,
  )
  const text = `${inquiry.subject}\nFrom ${inquiry.name} <${inquiry.email}>\n\n${inquiry.message}`
  return { subject, html, text }
}
