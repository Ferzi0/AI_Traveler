import type { ReactNode } from 'react'
import { LANDING_DESTINATIONS } from '../data/landingDestinations'
import { AppFooter } from './AppFooter'
import { BrandLogo } from './BrandLogo'
import '../App.css'

type Props = {
  title: string
  subtitle: string
  onGoHome: () => void
  children: ReactNode
  footer?: ReactNode
}

export function AuthPageLayout({ title, subtitle, onGoHome, children, footer }: Props) {
  return (
    <div className="authPage">
      <header className="topBar">
        <div className="topBarInner">
          <button type="button" className="logo logoBtn" aria-label="На главную" onClick={onGoHome}>
            <BrandLogo />
          </button>
        </div>
      </header>

      <div className="authBody">
        <div className="authLayout">
          <aside className="authVisual" aria-hidden>
            <p className="authVisual__eyebrow">Конструктор поездок</p>
            <h2 className="authVisual__title">Соберите маршрут за несколько минут</h2>
            <p className="authVisual__text">
              Рейсы Aviasales, проживание, перелёт и детали — всё в одном дереве решений.
            </p>
            <div className="authVisual__mosaic">
              {LANDING_DESTINATIONS.slice(0, 4).map((dest) => (
                <div
                  key={dest.city}
                  className="authVisual__tile"
                  style={{ backgroundImage: `url(${dest.imageUrl})` }}
                >
                  <span>{dest.city}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="authCard">
            <h1 className="authTitle">{title}</h1>
            <p className="authSubtitle">{subtitle}</p>
            {children}
            {footer}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
