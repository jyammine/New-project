export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LOCALE = 'en-US'

/** Convert a decimal amount (e.g. 24.5) into minor units (2450) without float drift. */
export const toMinorUnits = (amount: number): number => Math.round(amount * 100)

export const fromMinorUnits = (amount: number | null | undefined): number =>
  Math.round(amount ?? 0) / 100

/** Round a decimal amount to cents. */
export const roundMoney = (amount: number): number => Math.round(amount * 100) / 100

export function formatMoney(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
  } catch {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
    }).format(value)
  }
}
