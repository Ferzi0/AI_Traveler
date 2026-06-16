export function formatFlightDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(iso))
  } catch {
    return '—'
  }
}

export function formatTripDates(
  departureAt: string | null | undefined,
  returnAt: string | null | undefined
): string {
  const dep = formatFlightDate(departureAt)
  const ret = formatFlightDate(returnAt)
  if (dep !== '—' && ret !== '—') return `${dep} — ${ret}`
  if (dep !== '—') return dep
  if (ret !== '—') return ret
  return '—'
}

export function tripDaysFromApi(
  departureAt: string | null | undefined,
  returnAt: string | null | undefined
): number | null {
  if (!departureAt || !returnAt) return null
  try {
    const dep = new Date(departureAt)
    const ret = new Date(returnAt)
    const days = Math.round((ret.getTime() - dep.getTime()) / 86_400_000)
    return days > 0 ? days : null
  } catch {
    return null
  }
}

export function formatPrice(price: number, currency: string): string {
  const rounded = Math.round(price)
  const formatted = rounded.toLocaleString('ru-RU')
  const symbol = currency.toLowerCase() === 'rub' ? '₽' : currency.toUpperCase()
  return `${formatted} ${symbol}`
}

export function transfersLabel(transfers: number | null | undefined): string {
  if (transfers == null) return '—'
  if (transfers === 0) return 'Прямой'
  if (transfers === 1) return '1 пересадка'
  return `${transfers} пересадки`
}

export function airlineLogoUrl(airline: string | null | undefined, size = 32): string | null {
  if (!airline) return null
  return `https://pics.avs.io/${size}/${size}/${airline}.png`
}

export function routeLabel(origin: string, destination: string): string {
  return `${origin} → ${destination}`
}

export function destinationTitle(item: {
  destination_name?: string | null
  destination: string
  destination_airport?: string | null
}): string {
  return item.destination_name ?? item.destination_airport ?? item.destination
}

export function durationLabel(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}
