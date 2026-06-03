import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'
import { AppFooter } from './AppFooter'
import { CityCombobox } from './CityCombobox'
import { api } from '../api'
import type { PlatformStats } from '../types/stats'

type Props = {
  onLogin: () => void
  onRegister: () => void
}

const DESTINATIONS = [
  { city: 'Стамбул',   country: 'Турция',   emoji: '🕌', price: '28 400', direct: true,  days: 7,  bg: '#fde8d8' },
  { city: 'Пхукет',    country: 'Таиланд',  emoji: '🌴', price: '54 200', direct: false, days: 14, bg: '#ddf0e8' },
  { city: 'Париж',     country: 'Франция',  emoji: '🗼', price: '41 800', direct: true,  days: 5,  bg: '#e8e4f8' },
  { city: 'Дубай',     country: 'ОАЭ',      emoji: '🏙️', price: '36 900', direct: true,  days: 10, bg: '#fff8dd' },
  { city: 'Барселона', country: 'Испания',  emoji: '⛲', price: '38 500', direct: false, days: 12, bg: '#fde0e0' },
  { city: 'Токио',     country: 'Япония',   emoji: '⛩️', price: '67 300', direct: false, days: 10, bg: '#dceef8' },
]

const TAGS = ['🏖 Пляж', '🏙 Города', '🏔 Горы', '🎭 Культура', '🍜 Гастро']

export function LandingPage({ onLogin, onRegister }: Props) {
  const [origin, setOrigin]       = useState('Москва')
  const [startDate, setStartDate] = useState('2026-06-10')
  const [endDate, setEndDate]     = useState('2026-06-17')
  const [passengers, setPassengers] = useState(2)
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    void api<PlatformStats>('/stats').then(setStats).catch(() => null)
  }, [])

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
            <input id="l-start" type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="paramsCell">
            <label htmlFor="l-end">Обратно</label>
            <input id="l-end" type="date" value={endDate}
              onChange={e => setEndDate(e.target.value)} />
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

        <p className="landingSectionLabel">ПОПУЛЯРНЫЕ НАПРАВЛЕНИЯ</p>

        <div className="destCards">
          {DESTINATIONS.map(dest => (
            <button key={dest.city} type="button" className="destCard" onClick={onLogin}>
              <div className="destCard__img" style={{ background: dest.bg }}>
                <span className="destCard__emoji">{dest.emoji}</span>
                <span className="destCard__badge">{dest.days} дней</span>
              </div>
              <div className="destCard__body">
                <div className="destCard__city">{dest.city}</div>
                <div className="destCard__country">{dest.country}</div>
                <div className="destCard__footer">
                  <div className="destCard__price">
                    <span className="destCard__from">от </span>
                    <span className="destCard__val">{dest.price} ₽</span>
                  </div>
                  <div className="destCard__flight">
                    {dest.direct ? 'прямой рейс' : '1 пересадка'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

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
    </div>
  )
}