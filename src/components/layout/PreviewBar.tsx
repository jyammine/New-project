export function PreviewBar() {
  return (
    <div className="bg-butter text-sm text-ink">
      <div className="container-page flex items-center justify-between gap-4 py-2">
        <p>
          <strong>Preview mode</strong> — you&apos;re seeing drafts and hidden products.
        </p>
        {/* A plain link (not next/link) so the route handler always runs. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/next/exit-preview" className="font-bold underline underline-offset-4">
          Exit preview
        </a>
      </div>
    </div>
  )
}
