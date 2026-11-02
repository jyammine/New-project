import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import { ContactForm } from '@/components/forms/ContactForm'
import { getSettings } from '@/lib/queries'
import type { ContactBlock } from '@/payload-types'

export async function Contact({ block }: { block: ContactBlock }) {
  const settings = block.showStoreDetails ? await getSettings() : null
  return (
    <section className="container-page">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="text-3xl sm:text-4xl">{block.heading}</h2>
          {block.text && <p className="mt-3 text-lg text-ink-soft">{block.text}</p>}
          <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10">
            <ContactForm />
          </div>
        </div>
        {settings && (
          <aside
            className="flex flex-col gap-6 rounded-[2rem] bg-blush p-8 lg:col-span-2"
            aria-label="Store details"
          >
            {settings.address && (
              <div className="flex gap-4">
                <MapPin className="mt-1 size-5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-sans text-base font-extrabold tracking-normal">
                    Visit our shop
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-ink-soft">{settings.address}</p>
                  {settings.mapUrl && /^https?:\/\//.test(settings.mapUrl) && (
                    <a
                      href={settings.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-bold underline underline-offset-4"
                    >
                      Get directions
                    </a>
                  )}
                </div>
              </div>
            )}
            {settings.openingHours && settings.openingHours.length > 0 && (
              <div className="flex gap-4">
                <Clock className="mt-1 size-5 shrink-0" aria-hidden />
                <div className="flex-1">
                  <h3 className="font-sans text-base font-extrabold tracking-normal">
                    Opening hours
                  </h3>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-ink-soft">
                    {settings.openingHours.map((row) => (
                      <div key={row.id ?? row.days} className="contents">
                        <dt>{row.days}</dt>
                        <dd className="text-right sm:text-left">{row.hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
            {settings.email && (
              <div className="flex gap-4">
                <Mail className="mt-1 size-5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-sans text-base font-extrabold tracking-normal">Email</h3>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-ink-soft underline-offset-4 hover:underline"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            )}
            {settings.phone && (
              <div className="flex gap-4">
                <Phone className="mt-1 size-5 shrink-0" aria-hidden />
                <div>
                  <h3 className="font-sans text-base font-extrabold tracking-normal">Phone</h3>
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                    className="text-ink-soft underline-offset-4 hover:underline"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}
