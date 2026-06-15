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
