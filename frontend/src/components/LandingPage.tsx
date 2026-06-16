import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'
import { AppFooter } from './AppFooter'
import { ScrollToTopButton } from './ScrollToTopButton'
import { CityCombobox } from './CityCombobox'
import { PopularDirectionsPanel } from './PopularDirectionsPanel'
import { api } from '../api'
import type { PopularDestination, PopularDirectionsResponse } from '../types/flights'
import type { PlatformStats } from '../types/stats'
import { adjustDatesOnEndChange, adjustDatesOnStartChange, todayIsoLocal } from '../utils/tripDates'

type Props = {
  onLogin: () => void
  onRegister: () => void
}

const TAGS = ['🏖 Пляж', '🏙 Города', '🏔 Горы', '🎭 Культура', '🍜 Гастро']

export function LandingPage({ onLogin, onRegister }: Props) {
  const [origin, setOrigin]       = useState('Москва')
  const [startDate, setStartDate] = useState('2026-06-10')
  const [endDate, setEndDate]     = useState('2026-06-17')
  const [passengers, setPassengers] = useState(2)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [popular, setPopular] = useState<PopularDestination[]>([])
  const [popularOriginLabel, setPopularOriginLabel] = useState('Москва')
  const [popularCurrency, setPopularCurrency] = useState('rub')
  const [popularError, setPopularError] = useState<string | null>(null)
  const [popularLoading, setPopularLoading] = useState(true)

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

  return (
    <div className="landingPage">
      <header className="topBar">
        <div className="topBarInner">
          <span className="logo"><BrandLogo /></span>
          <div className="landingHeaderBtns">
            <button type="button" className="landingBtnGhost" onClick={onLogin}>
              Войти
            </button>
            <button type="button" className="landingBtnAccent" onClick={onRegister}>
              Зарегистрироваться
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="paramsBar">
          <div className="paramsCell paramsCell--origin">
            <label>Откуда</label>
            <CityCombobox id="landing-origin" value={origin} onChange={setOrigin} />
          </div>
          <div className="paramsCell">
            <label htmlFor="l-start">Когда</label>
            <input
              id="l-start"
              type="date"
              value={startDate}
              min={todayIsoLocal()}
              onChange={(e) => {
                const next = adjustDatesOnStartChange(e.target.value, endDate)
                setStartDate(next.startDate)
                setEndDate(next.endDate)
              }}
            />
          </div>
          <div className="paramsCell">
            <label htmlFor="l-end">Обратно</label>
            <input
              id="l-end"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                const next = adjustDatesOnEndChange(startDate, e.target.value)
                setEndDate(next.endDate)
              }}
            />
          </div>
          <div className="paramsCell">
            <label htmlFor="l-pax">Пассажиры</label>
            <input id="l-pax" type="number" min={1} max={12} value={passengers}
              onChange={e => setPassengers(Number(e.target.value))} />
          </div>
        </div>

        <section className="destinationHero" aria-labelledby="landing-hero-title">
          <h1 id="landing-hero-title" className="destinationHero__title">
            Куда отправимся?
          </h1>
          <div className="destinationHero__card">
            <div className="destinationHero__search">
              <input
                className="destinationSearch__input"
                placeholder="Пхукет, Лондон, Стамбул…"
                readOnly
                onClick={onLogin}
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <button type="button" className="btn btnAccent destinationHero__btn" onClick={onLogin}>
                Найти
              </button>
            </div>
          </div>
          <div className="landingTags">
            {TAGS.map(tag => (
              <button key={tag} type="button" className="landingTag" onClick={onLogin}>
                {tag}
              </button>
            ))}
          </div>
        </section>

        <PopularDirectionsPanel
          originLabel={popularOriginLabel}
          currency={popularCurrency}
          items={popular}
          loading={popularLoading}
          error={popularError}
          onSelect={onLogin}
        />

        {stats && (
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
        )}
      </main>

      <AppFooter />
      <ScrollToTopButton />
    </div>
  )
}
