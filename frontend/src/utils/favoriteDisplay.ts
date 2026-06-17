import { formatPrice } from './flightDisplay'

const PRICE_TIER_REPLACEMENTS: Array<[RegExp, string]> = [
  [/₽₽₽/g, 'премиум'],
  [/₽₽/g, 'средний чек'],
  [/ · ₽ · /g, ' · бюджет · '],
  [/\bUSD\b/gi, '₽'],
  [/\$/g, '₽'],
]

export function normalizeFavoriteCurrencyText(text: string | null | undefined): string {
  if (!text) return ''

  let normalized = text.replace(/\$\s?(\d[\d\s.,]*)/g, (_match, raw: string) => {
    const value = Number(raw.replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(value) ? formatPrice(value, 'rub', true) : `₽${raw}`
  })

  for (const [pattern, replacement] of PRICE_TIER_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement)
  }

  return normalized
}
