import type { ReactNode } from 'react'
import { HOME_HERO_IMAGE } from '../data/homeHero'

type Props = {
  paramsBar: ReactNode
  children: ReactNode
}

export function HomePageHero({ paramsBar, children }: Props) {
  return (
    <section className="homeHero" aria-labelledby="home-hero-title">
      <div
        className="homeHero__bg"
        style={{ backgroundImage: `url(${HOME_HERO_IMAGE})` }}
        aria-hidden
      />
      <div className="homeHero__shade" aria-hidden />
      <div className="homeHero__content">
        {paramsBar}
        <div className="homeHero__main">
          <h1 id="home-hero-title" className="homeHero__title">
            <span className="homeHero__titleText">Куда отправимся?</span>
            <span className="homeHero__trail" aria-hidden>
              <span className="homeHero__dots" />
              <span className="homeHero__plane">✈</span>
            </span>
          </h1>
          <p className="homeHero__subtitle">
            Откройте новые направления по вашим интересам и бюджету
          </p>
          {children}
        </div>
      </div>
    </section>
  )
}
