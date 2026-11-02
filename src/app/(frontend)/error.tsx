'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Oops — a little hiccup</h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">
        Please try again. If the problem continues, let us know and we&apos;ll sort it out.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Go home
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-ink-soft">Reference: {error.digest}</p>}
    </div>
  )
}
