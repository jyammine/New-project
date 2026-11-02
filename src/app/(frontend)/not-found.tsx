import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">This page has wandered off</h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">
        Like a missing sock, we can&apos;t find what you were looking for. Let&apos;s get you back
        on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">
          Shop all
        </Link>
        <Link href="/" className="btn btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  )
}
