import { createPortal } from 'react-dom'
import type { TransportItinerary } from '../types/trip'
import { formatPrice } from '../utils/flightDisplay'

type Props = {
  itinerary: TransportItinerary
  onClose: () => void
  /** Внутри fullscreen-панели (рейсы/отели) — без portal, поверх контента */
  embedded?: boolean
}

function cabinLabel(cabin: string): string {
  const map: Record<string, string> = {
    economy: 'Эконом',
    business: 'Бизнес',
    first: 'Первый класс',
  }
  return map[cabin.toLowerCase()] ?? cabin
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

function buyUrl(itinerary: TransportItinerary): string | null {
  return itinerary.details.aviasales_url ?? itinerary.details.sources[0]?.url ?? null
}

export function TransportDetailsPanel({ itinerary, onClose, embedded = false }: Props) {
  const { details } = itinerary
  const aviasales = buyUrl(itinerary)

  const content = (
    <div
      className={`detailsOverlay${embedded ? ' detailsOverlay--stacked' : ''}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="detailsPanel"
        role="dialog"
        aria-labelledby="transport-details-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="detailsHeader">
          <div>
            <h2 id="transport-details-title">Детали перелёта</h2>
            <p className="detailsSubtitle">
              {itinerary.outbound.title}
              {itinerary.inbound ? ` · ${itinerary.inbound.title}` : ''}
            </p>
          </div>
          <button type="button" className="detailsClose" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>

        <div className="detailsGrid">
          <div className="detailsStat">
            <span className="detailsStatLabel">Время в пути</span>
            <strong>{formatDuration(details.total_duration_min)}</strong>
          </div>
          <div className="detailsStat">
            <span className="detailsStatLabel">Класс</span>
            <strong>{cabinLabel(details.cabin_class)}</strong>
          </div>
          <div className="detailsStat">
            <span className="detailsStatLabel">На всех пассажиров</span>
            <strong>{formatPrice(itinerary.total_price, 'rub')}</strong>
          </div>
          <div className="detailsStat">
            <span className="detailsStatLabel">На 1 пассажира</span>
            <strong>{formatPrice(details.price_per_passenger, 'rub')}</strong>
          </div>
        </div>

        {aviasales ? (
          <div className="detailsBuy">
            <a
              href={aviasales}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btnAccent detailsBuy__btn"
            >
              Купить на Aviasales ↗
            </a>
          </div>
        ) : null}

        <section className="detailsSection">
          <h3>Сегменты маршрута</h3>
          {details.legs.map((leg) => (
            <article key={`${leg.direction}-${leg.id}`} className="detailsLeg">
              <div className="detailsLegHead">
                <span className="detailsLegDir">{leg.direction_label}</span>
                <strong>{leg.title}</strong>
              </div>
              <ul className="detailsLegMeta">
                <li>{leg.airline}</li>
                {leg.aircraft_model ? <li>{leg.aircraft_model}</li> : null}
                <li>{formatDuration(leg.duration_min)}</li>
              </ul>
            </article>
          ))}
        </section>

        {details.price_includes.length > 0 ? (
          <section className="detailsSection">
            <h3>В стоимость входит</h3>
            <ul className="detailsIncludes">
              {details.price_includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="detailsSection">
          <h3>Источник данных</h3>
          <p className="detailsNote">{details.data_source_note}</p>
          {details.sources.length > 0 ? (
            <div className="detailsSources">
              {details.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detailsSourceLink"
                >
                  {source.airline || 'Aviasales'} ↗
                </a>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )

  if (embedded) return content
  return createPortal(content, document.body)
}
