import { useState } from 'react'
import { AppFooter } from './AppFooter'
import { PhotoSlider } from './PhotoSlider'
import type { FavoriteItem } from '../types/favorites'

type Props = {
  items: FavoriteItem[]
  loading: boolean
  onClose: () => void
  onRemove: (id: number) => void
}

export function FavoritesPage({ items, loading, onClose, onRemove }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="pagePanelOverlay">
      <div className="pagePanel">
        <header className="topBar">
          <div className="topBarInner">
            <span className="logo">AI TRAVELER</span>
            <button type="button" className="menuBtn" aria-label="Закрыть" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        <div className="pagePanelBody">
          <h1 className="pageTitle">Избранное</h1>

          {loading ? <p className="emptyTree">Загрузка…</p> : null}

          {!loading && items.length === 0 ? (
            <p className="emptyTree">Нет сохранённых мест</p>
          ) : null}

          <div className="favoritesGrid">
            {items.map((item) => {
              const expanded = expandedId === item.id
              return (
                <article
                  key={item.id}
                  className={`favoriteCard${expanded ? ' favoriteCard--expanded' : ''}`}
                >
                  <button
                    type="button"
                    className="favoriteCard__head"
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                  >
                    <div
                      className="favoriteCard__thumb"
                      style={
                        item.image_urls[0]
                          ? { backgroundImage: `url(${item.image_urls[0]})` }
                          : undefined
                      }
                    >
                      {!item.image_urls[0] ? <span>Фото</span> : null}
                    </div>
                    <div className="favoriteCardContent">
                      <span className="favoriteCardTitle">{item.title}</span>
                      <span className="favoriteCardSub">
                        {item.item_type === 'city' ? 'Город' : 'Отель'}
                        {item.country ? ` · ${item.country}` : ''}
                      </span>
                    </div>
                    <span className="favoriteCard__chevron" aria-hidden>
                      {expanded ? '▲' : '▼'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="favoriteRemoveBtn"
                    aria-label="Удалить из избранного"
                    onClick={() => onRemove(item.id)}
                  >
                    ✕
                  </button>

                  {expanded ? (
                    <div className="favoriteCard__body">
                      <PhotoSlider images={item.image_urls} />
                      <p className="favoriteCard__description">{item.description}</p>
                      {item.subtitle ? (
                        <p className="favoriteCard__meta">{item.subtitle}</p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  )
}
