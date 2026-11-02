'use client'

import { useActionState, useId } from 'react'

import { type FormState, sendContactMessage } from '@/lib/actions/forms'

const initialState: FormState = { status: 'idle' }

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initialState)
  const id = useId()

  if (state.status === 'success') {
    return (
      <div className="rounded-3xl bg-sage p-8" role="status">
        <h3 className="text-2xl">Message sent</h3>
        <p className="mt-2 text-sage-strong">{state.message}</p>
      </div>
    )
  }

  const field = (name: string) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': Boolean(state.fieldErrors?.[name]),
    'aria-describedby': state.fieldErrors?.[name] ? `${id}-${name}-error` : undefined,
  })
  const error = (name: string) =>
    state.fieldErrors?.[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-sm font-semibold text-sale">
        {state.fieldErrors[name]}
      </p>
    ) : null

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this empty</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="label">
            Name
          </label>
          <input
            {...field('name')}
            className="input"
            autoComplete="name"
            required
            maxLength={120}
          />
          {error('name')}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="label">
            Email
          </label>
          <input {...field('email')} type="email" className="input" autoComplete="email" required />
          {error('email')}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-subject`} className="label">
          Subject
        </label>
        <input {...field('subject')} className="input" required maxLength={160} />
        {error('subject')}
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="label">
          Message
        </label>
        <textarea {...field('message')} className="input min-h-40" required maxLength={5000} />
        {error('message')}
      </div>
      {state.status === 'error' && state.message && (
        <p className="text-sm font-semibold text-sale" role="alert">
          {state.message}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
