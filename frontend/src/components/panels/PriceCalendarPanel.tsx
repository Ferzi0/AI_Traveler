import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import type { PriceCalendarDay, PriceCalendarResponse } from '../../types/flights'
import { formatPrice, transfersLabel } from '../../utils/flightDisplay'
import {
  addDaysIso,
  isoMonth,
  monthLabelRu,
  shiftIsoMonth,
  todayIsoLocal,
} from '../../utils/tripDates'

type Props = {
  origin: string
  destinationTitle: string
  startDate: string
  endDate: string
  onPickDates: (startDate: string, endDate: string) => void
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function buildMonthCells(month: string, items: PriceCalendarDay[]) {
  const priceByDate = new Map(items.map((row) => [row.date, row]))
  const [year, monthNum] = month.split('-').map(Number)
  const firstWeekday = (new Date(year, monthNum - 1, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const cells: Array<{ day: number | null; date: string | null; row?: PriceCalendarDay }> = []

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: null, date: null })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`
    cells.push({ day, date, row: priceByDate.get(date) })
  }
  return cells
}

export function PriceCalendarPanel({
  origin,
  destinationTitle,
  startDate,
  endDate,
  onPickDates,
}: Props) {
  const tripLength = useMemo(
    () => {
      if (!startDate || !endDate) return null
      try {
        const dep = new Date(`${startDate}T12:00:00`)
        const ret = new Date(`${endDate}T12:00:00`)
        const days = Math.round((ret.getTime() - dep.getTime()) / 86_400_000)
        return days > 0 ? days : null
      } catch {
        return null
      }
    },
    [startDate, endDate]
  )

  const [viewMonth, setViewMonth] = useState(() => isoMonth(startDate || todayIsoLocal()))
  const [items, setItems] = useState<PriceCalendarDay[]>([])
  const [currency, setCurrency] = useState('rub')
  const [routeLabel, setRouteLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setViewMonth(isoMonth(startDate || todayIsoLocal()))
  }, [startDate, destinationTitle])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      origin,
      destination: destinationTitle,
      depart_month: viewMonth,
    })
    if (tripLength) {
      params.set('trip_length', String(tripLength))
      params.set('return_month', isoMonth(endDate || startDate))
    }

    void api<PriceCalendarResponse>(`/flights/calendar?${params.toString()}`)
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setCurrency(res.currency)
        setRouteLabel(`${res.origin_label} → ${res.destination_label}`)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setItems([])
        setError(err instanceof Error ? err.message : 'Не удалось загрузить календарь цен')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [origin, destinationTitle, viewMonth, tripLength, endDate, startDate])

  const cheapestPrice = useMemo(() => {
    if (!items.length) return null
    return Math.min(...items.map((row) => row.price))
  }, [items])

  const cells = useMemo(() => buildMonthCells(viewMonth, items), [viewMonth, items])
  const today = todayIsoLocal()

  const handlePickDay = (row: PriceCalendarDay) => {
    const nextStart = row.date
    const returnIso = row.return_at?.slice(0, 10)
    const nextEnd =
      returnIso && returnIso >= nextStart
        ? returnIso
        : tripLength
          ? addDaysIso(nextStart, tripLength)
          : nextStart
    onPickDates(nextStart, nextEnd)
  }

  return (
    <section className="priceCalendar" aria-labelledby="price-calendar-title">
      <header className="priceCalendar__header">
        <div>
          <p id="price-calendar-title" className="priceCalendar__eyebrow">
            Календарь цен
          </p>
          {!loading && !error ? (
            <p className="priceCalendar__subtitle">
              {routeLabel || `${origin} → ${destinationTitle}`} · Aviasales
            </p>
          ) : null}
        </div>
        <div className="priceCalendar__nav">
          <button
            type="button"
            className="priceCalendar__navBtn"
            aria-label="Предыдущий месяц"
            onClick={() => setViewMonth((m) => shiftIsoMonth(m, -1))}
          >
            ←
          </button>
          <span className="priceCalendar__month">{monthLabelRu(viewMonth)}</span>
          <button
            type="button"
            className="priceCalendar__navBtn"
            aria-label="Следующий месяц"
            onClick={() => setViewMonth((m) => shiftIsoMonth(m, 1))}
          >
            →
          </button>
        </div>
      </header>

      {error ? (
        <p className="priceCalendar__message priceCalendar__message--error" role="alert">
          {error}
        </p>
      ) : null}

      {!error ? (
        <>
          <div className="priceCalendar__weekdays" aria-hidden="true">
            {WEEKDAYS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className={`priceCalendar__grid${loading ? ' priceCalendar__grid--loading' : ''}`}>
            {cells.map((cell, index) => {
              if (!cell.day || !cell.date) {
                return <span key={`empty-${index}`} className="priceCalendar__cell priceCalendar__cell--empty" />
              }

              const row = cell.row
              const isPast = cell.date < today
              const isSelected = cell.date === startDate
              const isCheapest = row != null && cheapestPrice != null && row.price === cheapestPrice
              const disabled = isPast || !row

              return (
                <button
                  key={cell.date}
                  type="button"
                  className={[
                    'priceCalendar__cell',
                    isSelected ? 'priceCalendar__cell--selected' : '',
                    isCheapest && row ? 'priceCalendar__cell--cheap' : '',
                    disabled ? 'priceCalendar__cell--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={disabled}
                  onClick={() => row && handlePickDay(row)}
                  aria-label={
                    row
                      ? `${cell.day} ${monthLabelRu(viewMonth)}, от ${formatPrice(row.price, currency)}`
                      : `${cell.day} ${monthLabelRu(viewMonth)}, нет данных`
                  }
                >
                  <span className="priceCalendar__day">{cell.day}</span>
                  {row ? (
                    <>
                      <span className="priceCalendar__price">{formatPrice(row.price, currency)}</span>
                      <span className="priceCalendar__meta">{transfersLabel(row.transfers)}</span>
                    </>
                  ) : (
                    <span className="priceCalendar__meta">—</span>
                  )}
                </button>
              )
            })}
          </div>
          {!loading && items.length === 0 ? (
            <p className="priceCalendar__message">За этот месяц цен пока нет</p>
          ) : null}
          {!loading && items.length > 0 ? (
            <p className="priceCalendar__hint">
              Нажмите на день с ценой — даты поездки обновятся. Зелёным отмечен самый дешёвый вылет.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
