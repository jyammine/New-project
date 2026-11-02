const nestMark = (
  <svg viewBox="0 0 48 48" aria-hidden="true" width="100%" height="100%">
    <circle cx="24" cy="24" r="24" fill="#f2c7be" />
    <path
      d="M11 27c3 7 8.5 10 13 10s10-3 13-10"
      fill="none"
      stroke="#2f2a35"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <path d="M14 27h20" stroke="#2f2a35" strokeWidth="2.6" strokeLinecap="round" />
    <ellipse cx="20" cy="22" rx="4" ry="5" fill="#fbf7f2" stroke="#2f2a35" strokeWidth="2" />
    <ellipse cx="28.5" cy="21" rx="4" ry="5" fill="#fbf7f2" stroke="#2f2a35" strokeWidth="2" />
  </svg>
)

export function Icon() {
  return (
    <span
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        maxWidth: 28,
        minWidth: 18,
        aspectRatio: '1',
      }}
    >
      {nestMark}
    </span>
  )
}

export function Logo() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ display: 'block', width: 44, height: 44 }}>{nestMark}</span>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, letterSpacing: '-0.01em' }}>
        Little Nest
      </span>
    </span>
  )
}
