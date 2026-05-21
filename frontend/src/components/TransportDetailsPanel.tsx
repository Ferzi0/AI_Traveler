import type { TransportItinerary } from '../types/trip'

type Props = {
  itinerary: TransportItinerary
  onClose: () => void
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

export function TransportDetailsPanel({ itinerary, onClose }: Props) {
  const { details } = itinerary

  return (
    <div className="detailsOverlay" role="presentation" onClick={onClose}>
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
            <strong>${itinerary.total_price}</strong>
          </div>
          <div className="detailsStat">
            <span className="detailsStatLabel">На 1 пассажира</span>
            <strong>${details.price_per_passenger}</strong>
          </div>
        </div>

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
                <li>{leg.aircraft_model}</li>
                <li>{formatDuration(leg.duration_min)}</li>
              </ul>
            </article>
          ))}
        </section>

        <section className="detailsSection">
          <h3>В стоимость входит</h3>
          <ul className="detailsIncludes">
            {details.price_includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="detailsSection">
          <h3>Источники данных</h3>
          <p className="detailsNote">{details.data_source_note}</p>
          <div className="detailsSources">
            {details.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="detailsSourceLink"
              >
                {source.airline || 'Сайт авиакомпании'} ↗
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
