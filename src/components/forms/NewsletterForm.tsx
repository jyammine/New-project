'use client'

import { useActionState, useId } from 'react'

import { cn } from '@/components/ui/cn'
import { type FormState, subscribeToNewsletter } from '@/lib/actions/forms'

const initialState: FormState = { status: 'idle' }

export function NewsletterForm({ source, className }: { source: string; className?: string }) {
  const [state, action, pending] = useActionState(subscribeToNewsletter, initialState)
  const id = useId()

  if (state.status === 'success') {
    return (
      <p
        className={cn('rounded-2xl bg-sage px-5 py-4 font-semibold text-sage-strong', className)}
        role="status"
      >
        {state.message}
      </p>
    )
  }

  return (
    <form action={action} className={cn('w-full', className)} noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this empty</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          className="input flex-1 rounded-full"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? `${id}-error` : undefined}
        />
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {(state.fieldErrors?.email || (state.status === 'error' && state.message)) && (
        <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-sale" role="alert">
          {state.fieldErrors?.email ?? state.message}
        </p>
      )}
    </form>
  )
}
