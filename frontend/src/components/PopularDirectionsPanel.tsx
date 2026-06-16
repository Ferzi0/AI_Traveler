import type { PopularDestination } from '../types/flights'
import {
  airlineLogoUrl,
  durationLabel,
  formatPrice,
  formatTripDates,
  routeLabel,
  transfersLabel,
  tripDaysFromApi,
} from '../utils/flightDisplay'

type Props = {
  originLabel: string
  currency: string
  items: PopularDestination[]
  loading: boolean
  error: string | null
  onSelect: () => void
}

export function PopularDirectionsPanel({
  originLabel,
  currency,
  items,
  loading,
  error,
  onSelect,
}: Props) {
  return (
    <section className="flightOffers" aria-labelledby="popular-directions-title">
      <header className="flightOffers__header">
        <div>
          <p id="popular-directions-title" className="flightOffers__eyebrow">
            Популярные направления
          </p>
          {!loading && !error && items.length > 0 ? (
            <p className="flightOffers__subtitle">Актуальные цены из {originLabel} · Aviasales</p>
          ) : null}
        </div>
        {!loading && items.length > 0 ? (
          <span className="flightOffers__count">{items.length} маршрутов</span>
        ) : null}
      </header>

      {error ? (
        <p className="flightOffers__message flightOffers__message--error" role="alert">
          {error}
        </p>
      ) : null}

      {!error && !loading && items.length === 0 ? (
        <p className="flightOffers__message">Направления не найдены</p>
      ) : null}

      {items.length > 0 ? (
        <ul className={`flightOffers__list${loading ? ' flightOffers__list--loading' : ''}`}>
          {items.map((dest) => {
            const logo = airlineLogoUrl(dest.airline)
            const days = tripDaysFromApi(dest.departure_at, dest.return_at)
            const duration = durationLabel(dest.duration ?? dest.duration_to)
            const dates = formatTripDates(dest.departure_at, dest.return_at)

            return (
              <li key={`${dest.origin}-${dest.destination}-${dest.departure_at ?? ''}`}>
                <button type="button" className="flightOffer" onClick={onSelect}>
                  <div className="flightOffer__route">
                    <span className="flightOffer__codes">
                      {routeLabel(dest.origin, dest.destination)}
                    </span>
                    <span className="flightOffer__city">{dest.city}</span>
                    {dest.country ? (
                      <span className="flightOffer__country">{dest.country}</span>
                    ) : null}
                  </div>

                  <div className="flightOffer__schedule">
                    <span className="flightOffer__label">Даты</span>
                    <span className="flightOffer__value">{dates}</span>
                    {days != null ? (
                      <span className="flightOffer__hint">{days} дн. в поездке</span>
                    ) : null}
                  </div>

                  <div className="flightOffer__details">
                    <span className="flightOffer__label">Рейс</span>
                    <span className="flightOffer__chip">{transfersLabel(dest.transfers)}</span>
                    {(dest.airline || dest.flight_number != null || duration) && (
                      <span className="flightOffer__airline">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            className="flightOffer__airlineLogo"
                            loading="lazy"
                            width={22}
                            height={22}
                          />
                        ) : null}
                        {[dest.airline, dest.flight_number != null ? `№${dest.flight_number}` : null, duration]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>

                  <div className="flightOffer__priceBlock">
                    <span className="flightOffer__priceLabel">от</span>
                    <span className="flightOffer__price">{formatPrice(dest.price, currency)}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
