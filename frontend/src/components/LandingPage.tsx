import { useState } from 'react'
import { BrandLogo } from './BrandLogo'
import { ScrollToTopButton } from './ScrollToTopButton'
import { CityCombobox } from './CityCombobox'
import { HomeDiscoverySections } from './HomeDiscoverySections'
import { LANDING_TAGS } from './landingTags'
import { adjustDatesOnEndChange, adjustDatesOnStartChange, defaultTripDateRange, todayIsoLocal } from '../utils/tripDates'

type Props = {
  onLogin: () => void
  onRegister: () => void
}

export function LandingPage({ onLogin, onRegister }: Props) {
  const [origin, setOrigin]       = useState('Москва')
  const [startDate, setStartDate] = useState(() => defaultTripDateRange().startDate)
  const [endDate, setEndDate]     = useState(() => defaultTripDateRange().endDate)
  const [passengers, setPassengers] = useState(2)

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
            {LANDING_TAGS.map(tag => (
              <button key={tag} type="button" className="landingTag" onClick={onLogin}>
                {tag}
              </button>
            ))}
          </div>
        </section>

        <HomeDiscoverySections
          origin={origin}
          startDate={startDate}
          endDate={endDate}
          onPickDates={(nextStart, nextEnd) => {
            const next = adjustDatesOnStartChange(nextStart, nextEnd)
            setStartDate(next.startDate)
            setEndDate(next.endDate)
          }}
          onBuildTrip={() => onLogin()}
        />
      </main>

      <ScrollToTopButton />
    </div>
  )
}
