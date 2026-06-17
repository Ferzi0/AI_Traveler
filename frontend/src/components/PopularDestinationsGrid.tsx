import { LANDING_DESTINATIONS } from '../data/landingDestinations'

const GRID_DESTINATIONS = [
  LANDING_DESTINATIONS.find((d) => d.city === 'Стамбул'),
  LANDING_DESTINATIONS.find((d) => d.city === 'Пхукет'),
  LANDING_DESTINATIONS.find((d) => d.city === 'Дубай'),
  LANDING_DESTINATIONS.find((d) => d.city === 'Париж'),
].filter((d): d is (typeof LANDING_DESTINATIONS)[number] => Boolean(d))

type Props = {
  onPickCity: (city: string) => void
  isFavorite?: (city: string) => boolean
  onToggleFavorite?: (city: string) => void
  onViewAll?: () => void
}

function cityKey(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

export function PopularDestinationsGrid({
  onPickCity,
  isFavorite,
  onToggleFavorite,
  onViewAll,
}: Props) {
  return (
    <section className="destGrid" aria-labelledby="popular-destinations-grid">
      <header className="destGrid__header">
        <h2 id="popular-destinations-grid" className="destGrid__title">
          Популярные направления
        </h2>
        {onViewAll ? (
          <button type="button" className="destGrid__link" onClick={onViewAll}>
            Смотреть все
          </button>
        ) : null}
      </header>

      <ul className="destGrid__list">
        {GRID_DESTINATIONS.map((dest) => {
          const favorited = isFavorite?.(dest.city) ?? false
          return (
            <li key={dest.city}>
              <article className="destGrid__card">
                <button
                  type="button"
                  className="destGrid__pick"
                  onClick={() => onPickCity(dest.city)}
                >
                  <div
                    className="destGrid__img"
                    style={{ backgroundImage: `url(${dest.imageUrl})` }}
                  />
                  <div className="destGrid__shade" aria-hidden />
                  <div className="destGrid__body">
                    <span className="destGrid__city">{dest.city}</span>
                    <span className="destGrid__country">{dest.country}</span>
                    <span className="destGrid__price">от {dest.price} ₽</span>
                  </div>
                </button>
                {onToggleFavorite ? (
                  <button
                    type="button"
                    className={`destGrid__heart${favorited ? ' destGrid__heart--active' : ''}`}
                    aria-label={
                      favorited
                        ? `Убрать ${dest.city} из избранного`
                        : `Добавить ${dest.city} в избранное`
                    }
                    onClick={() => onToggleFavorite(dest.city)}
                  >
                    {favorited ? '♥' : '♡'}
                  </button>
                ) : null}
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
