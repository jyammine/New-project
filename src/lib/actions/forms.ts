'use server'

import { z } from 'zod'

import { getPayloadClient } from '@/lib/payload'
import { clientIp, rateLimit } from '@/lib/rate-limit'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

const fieldErrors = (error: z.ZodError): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!result[key]) result[key] = issue.message
  }
  return result
}

const newsletterSchema = z.object({
  email: z.email('Please enter a valid email address.').max(254),
  source: z.string().max(40).optional(),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional(),
})

export async function subscribeToNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({
    email: String(formData.get('email') ?? '')
      .trim()
      .toLowerCase(),
    source: String(formData.get('source') ?? '') || undefined,
    website: String(formData.get('website') ?? ''),
  })
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the form.',
      fieldErrors: fieldErrors(parsed.error),
    }
  }
  if (parsed.data.website) return { status: 'success', message: 'Thanks for subscribing!' }

  const limited = rateLimit(`newsletter:${await clientIp()}`, 5, 10 * 60 * 1000)
  if (!limited.ok)
    return { status: 'error', message: 'Too many attempts. Please try again in a few minutes.' }

  const payload = await getPayloadClient()
  try {
    const existing = await payload.count({
      collection: 'subscribers',
      where: { email: { equals: parsed.data.email } },
      overrideAccess: true,
    })
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'subscribers',
        data: { email: parsed.data.email, source: parsed.data.source ?? 'website' },
        overrideAccess: true,
      })
    }
  } catch (err) {
    payload.logger.error({ err, msg: 'Newsletter signup failed' })
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
  return { status: 'success', message: 'Thanks for subscribing! Welcome to the nest.' }
}

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please tell us your name.').max(120),
  email: z.email('Please enter a valid email address.').max(254),
  subject: z.string().trim().min(1, 'Please add a subject.').max(160),
  message: z
    .string()
    .trim()
    .min(10, 'Your message is a little short — could you add some detail?')
    .max(5000, 'Please keep your message under 5000 characters.'),
  website: z.string().max(0).optional(),
})

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? '').trim(),
    subject: String(formData.get('subject') ?? ''),
    message: String(formData.get('message') ?? ''),
    website: String(formData.get('website') ?? ''),
  })
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors: fieldErrors(parsed.error),
    }
  }
  if (parsed.data.website)
    return { status: 'success', message: 'Thank you! We’ll be in touch soon.' }

  const limited = rateLimit(`contact:${await clientIp()}`, 3, 10 * 60 * 1000)
  if (!limited.ok)
    return { status: 'error', message: 'Too many messages. Please try again in a few minutes.' }

  const payload = await getPayloadClient()
  try {
    await payload.create({
      collection: 'inquiries',
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Contact form submission failed' })
    return {
      status: 'error',
      message: 'Something went wrong. Please try again or email us directly.',
    }
  }
  return { status: 'success', message: 'Thank you! We usually reply within one working day.' }
}
