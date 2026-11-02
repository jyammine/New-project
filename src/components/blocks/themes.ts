export const themeClasses: Record<string, string> = {
  blush: 'bg-blush',
  sage: 'bg-sage',
  sky: 'bg-sky',
  butter: 'bg-butter',
  cream: 'bg-sand',
}

export const themeClass = (theme: string | null | undefined): string =>
  themeClasses[theme ?? 'blush'] ?? 'bg-blush'
