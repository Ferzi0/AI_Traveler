import { useRef, useState } from 'react'
import { AppFooter } from './AppFooter'
import { BrandLogo } from './BrandLogo'
import { PhotoSlider } from './PhotoSlider'
import { ReviewsSection } from './ReviewsSection'
import { ScrollToTopButton } from './ScrollToTopButton'
import type { FavoriteItem } from '../types/favorites'
import { favoriteGallery } from '../utils/favoriteImages'
import { favoriteItemTypeLabel, favoriteReviewTarget } from '../utils/favoriteCatalog'
import { normalizeFavoriteCurrencyText } from '../utils/favoriteDisplay'
import { imageBackgroundStyle } from '../utils/images'

type Props = {
  items: FavoriteItem[]
  loading: boolean
  onClose: () => void
  onRemove: (id: number) => void
}

export function FavoritesPage({ items, loading, onClose, onRemove }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="pagePanelOverlay" ref={overlayRef}>
      <div className="pagePanel">
        <header className="topBar">
          <div className="topBarInner">
            <button type="button" className="logo logoBtn" aria-label="На главную" onClick={onClose}>
              <BrandLogo />
            </button>
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
              const gallery = favoriteGallery(item)
              const reviewTarget = favoriteReviewTarget(item)
              const description = normalizeFavoriteCurrencyText(item.description)
              const subtitle = normalizeFavoriteCurrencyText(item.subtitle)
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
                      style={imageBackgroundStyle(gallery[0])}
                    >
                      {!gallery[0] ? <span>Фото</span> : null}
                    </div>
                    <div className="favoriteCardContent">
                      <span className="favoriteCardTitle">{item.title}</span>
                      <span className="favoriteCardSub">
                        {favoriteItemTypeLabel(item.item_type)}
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
                      <PhotoSlider images={gallery} />
                      <p className="favoriteCard__description">{description}</p>
                      {subtitle ? (
                        <p className="favoriteCard__meta">{subtitle}</p>
                      ) : null}
                      {reviewTarget ? (
                        <div className="favoriteCard__reviews">
                          <ReviewsSection
                            entityType={reviewTarget.entityType}
                            entityId={reviewTarget.entityId}
                            category={reviewTarget.category}
                            active={expanded}
                          />
                        </div>
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
      <ScrollToTopButton scrollRoot={overlayRef} />
    </div>
  )
}
