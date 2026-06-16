import { useEffect, useState } from 'react'
import { PriceCalendarPanel } from './panels/PriceCalendarPanel'
import type { PopularDestination } from '../types/flights'

type Props = {
  origin: string
  startDate: string
  endDate: string
  destinations: PopularDestination[]
  loading: boolean
  onPickDates: (startDate: string, endDate: string) => void
}

export function LandingPriceCalendarSection({
  origin,
  startDate,
  endDate,
  destinations,
  loading,
  onPickDates,
}: Props) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  useEffect(() => {
    if (destinations.length === 0) {
      setSelectedCity(null)
      return
    }
    setSelectedCity((prev) => {
      if (prev && destinations.some((row) => row.city === prev)) return prev
      return destinations[0].city
    })
  }, [destinations])

  if (!loading && destinations.length === 0) return null

  return (
    <section className="landingCalendar" aria-labelledby="landing-calendar-title">
      <header className="landingCalendar__header">
        <div>
          <p id="landing-calendar-title" className="landingCalendar__eyebrow">
            Гибкие даты
          </p>
          <p className="landingCalendar__subtitle">
            Календарь цен Aviasales — выберите направление и день вылета
          </p>
        </div>
      </header>

      {loading ? (
        <div className="landingCalendar__chips landingCalendar__chips--loading" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="landingCalendar__chipSkeleton" />
          ))}
        </div>
      ) : (
        <div className="landingCalendar__chips" role="tablist" aria-label="Направления для календаря">
          {destinations.map((dest) => (
            <button
              key={`${dest.origin}-${dest.destination}-${dest.city}`}
              type="button"
              role="tab"
              aria-selected={selectedCity === dest.city}
              className={`landingCalendar__chip${selectedCity === dest.city ? ' landingCalendar__chip--active' : ''}`}
              onClick={() => setSelectedCity(dest.city)}
            >
              {dest.city}
            </button>
          ))}
        </div>
      )}

      {selectedCity && !loading ? (
        <PriceCalendarPanel
          origin={origin}
          destinationTitle={selectedCity}
          startDate={startDate}
          endDate={endDate}
          onPickDates={onPickDates}
        />
      ) : null}
    </section>
  )
}
