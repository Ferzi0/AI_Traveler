/** Сравнение ISO-дат YYYY-MM-DD без timezone-сюрпризов. */
export function compareIsoDates(a: string, b: string): number {
  return a.localeCompare(b)
}

export function clampEndDate(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return endDate
  return compareIsoDates(endDate, startDate) < 0 ? startDate : endDate
}

export function adjustDatesOnStartChange(
  startDate: string,
  endDate: string
): { startDate: string; endDate: string } {
  return { startDate, endDate: clampEndDate(startDate, endDate) }
}

export function adjustDatesOnEndChange(
  startDate: string,
  endDate: string
): { startDate: string; endDate: string } {
  if (compareIsoDates(endDate, startDate) < 0) {
    return { startDate, endDate: startDate }
  }
  return { startDate, endDate }
}

export function isEndBeforeStart(startDate: string, endDate: string): boolean {
  return Boolean(startDate && endDate && compareIsoDates(endDate, startDate) < 0)
}

export function todayIsoLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isoMonth(iso: string): string {
  return iso.slice(0, 7)
}

export function daysBetweenIso(start: string, end: string): number | null {
  if (!start || !end) return null
  try {
    const dep = new Date(`${start}T12:00:00`)
    const ret = new Date(`${end}T12:00:00`)
    const days = Math.round((ret.getTime() - dep.getTime()) / 86_400_000)
    return days > 0 ? days : null
  } catch {
    return null
  }
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function shiftIsoMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const ny = d.getFullYear()
  const nm = String(d.getMonth() + 1).padStart(2, '0')
  return `${ny}-${nm}`
}

export function monthLabelRu(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const label = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}
