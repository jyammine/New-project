import type { Payload } from 'payload'

import type { Inquiry, Order } from '@/payload-types'
import { DEFAULT_LOCALE } from '@/lib/money'
import { getServerSideURL } from '@/lib/urls'

import {
  type EmailBrand,
  type EmailOrder,
  inquiryNotificationEmail,
  newOrderNotificationEmail,
  orderConfirmationEmail,
  orderShippedEmail,
} from './templates'

async function getBrand(
  payload: Payload,
): Promise<EmailBrand & { notificationEmail?: string | null }> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
  return {
    siteName: settings?.siteName || 'Little Nest',
    siteUrl: getServerSideURL(),
    locale: settings?.locale || DEFAULT_LOCALE,
    supportEmail: settings?.email,
    notificationEmail: settings?.notificationEmail || settings?.email,
  }
}

const toEmailOrder = (order: Order): EmailOrder => ({
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  email: order.email,
  currency: order.currency,
  subtotal: order.subtotal,
  shippingTotal: order.shippingTotal,
  taxTotal: order.taxTotal,
  discountTotal: order.discountTotal,
  total: order.total,
  items: (order.items ?? []).map((item) => ({
    title: item.title,
    size: item.size,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
  shippingAddress: order.shippingAddress,
  trackingCarrier: order.trackingCarrier,
  trackingNumber: order.trackingNumber,
  trackingUrl: order.trackingUrl,
})

export async function sendOrderEmails(payload: Payload, order: Order): Promise<void> {
  const brand = await getBrand(payload)
  const emailOrder = toEmailOrder(order)

  if (order.email) {
    const { subject, html, text } = orderConfirmationEmail(emailOrder, brand)
    await payload.sendEmail({
      to: order.email,
      subject,
      html,
      text,
      replyTo: brand.supportEmail || undefined,
    })
  }

  if (brand.notificationEmail) {
    const adminUrl = `${brand.siteUrl}/admin/collections/orders/${order.id}`
    const { subject, html, text } = newOrderNotificationEmail(emailOrder, brand, adminUrl)
    await payload.sendEmail({ to: brand.notificationEmail, subject, html, text })
  }
}

export async function sendShippingConfirmation(payload: Payload, order: Order): Promise<void> {
  if (!order.email) return
  const brand = await getBrand(payload)
  const { subject, html, text } = orderShippedEmail(toEmailOrder(order), brand)
  await payload.sendEmail({
    to: order.email,
    subject,
    html,
    text,
    replyTo: brand.supportEmail || undefined,
  })
}

export async function sendInquiryNotification(payload: Payload, inquiry: Inquiry): Promise<void> {
  const brand = await getBrand(payload)
  if (!brand.notificationEmail) return
  const { subject, html, text } = inquiryNotificationEmail(inquiry, brand)
  await payload.sendEmail({
    to: brand.notificationEmail,
    subject,
    html,
    text,
    replyTo: inquiry.email,
  })
}
