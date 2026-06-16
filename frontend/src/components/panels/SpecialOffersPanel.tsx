import { FlightOffersSkeleton } from '../FlightOffersSkeleton'
import type { SpecialOffer } from '../../types/flights'
import {
  airlineLogoUrl,
  durationLabel,
  formatPrice,
  formatTripDates,
  routeLabel,
  tripDaysFromApi,
} from '../../utils/flightDisplay'

type Props = {
  originLabel: string
  destinationLabel?: string | null
  currency: string
  items: SpecialOffer[]
  loading: boolean
  error: string | null
}

export function SpecialOffersPanel({
  originLabel,
  destinationLabel,
  currency,
  items,
  loading,
  error,
}: Props) {
  const subtitle = destinationLabel
    ? `Спецпредложения ${originLabel} → ${destinationLabel}`
    : `Горящие билеты из ${originLabel}`

  const showSkeleton = loading && items.length === 0

  return (
    <section className="flightOffers flightOffers--special" aria-labelledby="special-offers-title">
      <header className="flightOffers__header">
        <div>
          <p id="special-offers-title" className="flightOffers__eyebrow">
            Спецпредложения
          </p>
          {!loading && !error && items.length > 0 ? (
            <p className="flightOffers__subtitle">{subtitle} · Aviasales</p>
          ) : null}
        </div>
        {!loading && items.length > 0 ? (
          <span className="flightOffers__count">{items.length} предложений</span>
        ) : null}
      </header>

      {error ? (
        <p className="flightOffers__message flightOffers__message--error" role="alert">
          {error}
        </p>
      ) : null}

      {showSkeleton ? <FlightOffersSkeleton rows={4} /> : null}

      {!error && !loading && items.length === 0 ? (
        <p className="flightOffers__message">Спецпредложения не найдены</p>
      ) : null}

      {items.length > 0 ? (
        <ul className={`flightOffers__list${loading ? ' flightOffers__list--loading' : ''}`}>
          {items.map((offer) => {
            const logo = airlineLogoUrl(offer.airline)
            const days = tripDaysFromApi(offer.departure_at, offer.return_at)
            const duration = durationLabel(offer.duration)
            const dates = formatTripDates(offer.departure_at, offer.return_at)
            const href = offer.aviasales_url
            const title = offer.title || offer.mini_title

            return (
              <li key={`${offer.origin}-${offer.destination}-${offer.departure_at ?? offer.title ?? ''}`}>
                {href ? (
                  <a
                    href={href}
                    className="flightOffer flightOffer--external"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OfferBody
                      offer={offer}
                      logo={logo}
                      days={days}
                      duration={duration}
                      dates={dates}
                      title={title}
                      currency={currency}
                    />
                    <span className="flightOffer__external">Aviasales ↗</span>
                  </a>
                ) : (
                  <div className="flightOffer">
                    <OfferBody
                      offer={offer}
                      logo={logo}
                      days={days}
                      duration={duration}
                      dates={dates}
                      title={title}
                      currency={currency}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}

function OfferBody({
  offer,
  logo,
  days,
  duration,
  dates,
  title,
  currency,
}: {
  offer: SpecialOffer
  logo: string | null
  days: number | null
  duration: string | null
  dates: string
  title?: string | null
  currency: string
}) {
  return (
    <>
      <div className="flightOffer__route">
        <span className="flightOffer__codes">{routeLabel(offer.origin, offer.destination)}</span>
        <span className="flightOffer__city">{offer.city}</span>
        {offer.country ? <span className="flightOffer__country">{offer.country}</span> : null}
        {title ? <span className="flightOffer__promo">{title}</span> : null}
      </div>

      <div className="flightOffer__schedule">
        <span className="flightOffer__label">Даты</span>
        <span className="flightOffer__value">{dates}</span>
        {days != null ? <span className="flightOffer__hint">{days} дн. в поездке</span> : null}
      </div>

      <div className="flightOffer__details">
        <span className="flightOffer__label">Рейс</span>
        {(offer.airline || offer.flight_number != null || duration) && (
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
            {[offer.airline_title || offer.airline, offer.flight_number != null ? `№${offer.flight_number}` : null, duration]
              .filter(Boolean)
              .join(' · ')}
          </span>
        )}
      </div>

      <div className="flightOffer__priceBlock">
        <span className="flightOffer__priceLabel">от</span>
        <span className="flightOffer__price">{formatPrice(offer.price, currency)}</span>
      </div>
    </>
  )
}
