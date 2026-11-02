export const SIZES = [
  { label: 'Newborn', value: 'nb' },
  { label: '0–3 months', value: '0-3m' },
  { label: '3–6 months', value: '3-6m' },
  { label: '6–12 months', value: '6-12m' },
  { label: '12–18 months', value: '12-18m' },
  { label: '18–24 months', value: '18-24m' },
  { label: '2–3 years', value: '2-3y' },
  { label: '3–4 years', value: '3-4y' },
  { label: 'One size', value: 'os' },
] as const

export type SizeValue = (typeof SIZES)[number]['value']

export const sizeLabel = (value: string | null | undefined): string =>
  SIZES.find((size) => size.value === value)?.label ?? value ?? ''

export const CURRENCIES = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Canadian Dollar (CAD)', value: 'CAD' },
  { label: 'Australian Dollar (AUD)', value: 'AUD' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['value']

export const SHIPPING_COUNTRIES = [
  { label: 'United States', value: 'US' },
  { label: 'Canada', value: 'CA' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Ireland', value: 'IE' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Spain', value: 'ES' },
  { label: 'Italy', value: 'IT' },
  { label: 'Portugal', value: 'PT' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'Belgium', value: 'BE' },
  { label: 'Luxembourg', value: 'LU' },
  { label: 'Austria', value: 'AT' },
  { label: 'Switzerland', value: 'CH' },
  { label: 'Denmark', value: 'DK' },
  { label: 'Sweden', value: 'SE' },
  { label: 'Norway', value: 'NO' },
  { label: 'Finland', value: 'FI' },
  { label: 'Poland', value: 'PL' },
  { label: 'Australia', value: 'AU' },
  { label: 'New Zealand', value: 'NZ' },
] as const

/** Maximum quantity of a single variant per order. */
export const MAX_QTY_PER_LINE = 10

/** Maximum number of distinct lines in a cart. */
export const MAX_CART_LINES = 30

export const CART_STORAGE_KEY = 'littlenest.cart.v1'
