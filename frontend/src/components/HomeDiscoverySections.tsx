import { useEffect, useState } from 'react'
import { PopularDirectionsPanel } from './PopularDirectionsPanel'
import { LandingPriceCalendarSection } from './LandingPriceCalendarSection'
import { SpecialOffersPanel } from './panels/SpecialOffersPanel'
import { api } from '../api'
import type { PopularDestination, PopularDirectionsResponse, SpecialOffer, SpecialOffersResponse } from '../types/flights'
import type { PlatformStats } from '../types/stats'
import { adjustDatesOnStartChange } from '../utils/tripDates'

type Props = {
  origin: string
  startDate: string
  endDate: string
  onPickDates: (startDate: string, endDate: string) => void
  onBuildTrip: (city: string) => void
}

export function HomeDiscoverySections({
  origin,
  startDate,
  endDate,
  onPickDates,
  onBuildTrip,
}: Props) {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [popular, setPopular] = useState<PopularDestination[]>([])
  const [popularOriginLabel, setPopularOriginLabel] = useState('Москва')
  const [popularCurrency, setPopularCurrency] = useState('rub')
  const [popularError, setPopularError] = useState<string | null>(null)
  const [popularLoading, setPopularLoading] = useState(true)
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [specialOffersCurrency, setSpecialOffersCurrency] = useState('rub')
  const [specialOffersError, setSpecialOffersError] = useState<string | null>(null)
  const [specialOffersLoading, setSpecialOffersLoading] = useState(true)

  useEffect(() => {
    void api<PlatformStats>('/stats').then(setStats).catch(() => null)
  }, [])

  useEffect(() => {
    let cancelled = false
    setPopularLoading(true)
    setPopularError(null)
    void api<PopularDirectionsResponse>(
      `/flights/popular?origin=${encodeURIComponent(origin)}&limit=6`
    )
      .then((res) => {
        if (cancelled) return
        setPopular(res.items)
        setPopularOriginLabel(res.origin_label)
        setPopularCurrency(res.currency)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setPopular([])
        setPopularError(err instanceof Error ? err.message : 'Не удалось загрузить направления')
      })
      .finally(() => {
        if (!cancelled) setPopularLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [origin])

  useEffect(() => {
    let cancelled = false
    setSpecialOffersLoading(true)
    setSpecialOffersError(null)
    void api<SpecialOffersResponse>(
      `/flights/special-offers?origin=${encodeURIComponent(origin)}&limit=6`
    )
      .then((res) => {
        if (cancelled) return
        setSpecialOffers(res.items)
        setSpecialOffersCurrency(res.currency)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setSpecialOffers([])
        setSpecialOffersError(err instanceof Error ? err.message : 'Не удалось загрузить спецпредложения')
      })
      .finally(() => {
        if (!cancelled) setSpecialOffersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [origin])

  function handleCalendarPickDates(nextStart: string, nextEnd: string) {
    const next = adjustDatesOnStartChange(nextStart, nextEnd)
    onPickDates(next.startDate, next.endDate)
  }

  return (
    <>
      <PopularDirectionsPanel
        originLabel={popularOriginLabel}
        currency={popularCurrency}
        items={popular}
        loading={popularLoading}
        error={popularError}
        onBuildTrip={onBuildTrip}
      />

      <LandingPriceCalendarSection
        origin={origin}
        startDate={startDate}
        endDate={endDate}
        destinations={popular}
        loading={popularLoading}
        onPickDates={handleCalendarPickDates}
      />

      <SpecialOffersPanel
        originLabel={popularOriginLabel}
        currency={specialOffersCurrency}
        items={specialOffers}
        loading={specialOffersLoading}
        error={specialOffersError}
      />

      {stats ? (
        <div className="landingStats">
          <div className="landingStat">
            <span className="landingStat__num">{stats.users_count}</span>
            <span className="landingStat__label">ПУТЕШЕСТВЕННИКА</span>
          </div>
          <div className="landingStat landingStat--divider">
            <span className="landingStat__num">{stats.trips_count}</span>
            <span className="landingStat__label">МАРШРУТОВ</span>
          </div>
        </div>
      ) : null}
    </>
  )
}
