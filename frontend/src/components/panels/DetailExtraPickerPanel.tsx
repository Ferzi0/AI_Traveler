import { useEffect, useMemo, useState } from 'react'
import { FavoriteButton } from '../FavoriteButton'
import { PhotoSlider } from '../PhotoSlider'
import { StarRating } from '../StarRating'
import { FilterToolbar } from './FilterToolbar'
import { ModalPanel } from './ModalPanel'
import { PickerItemDetailView } from './PickerItemDetailView'
import type { HotelExtraItem } from '../../types/trip'
import type { CatalogEntityType } from '../../types/reviews'
import { formatPrice } from '../../utils/flightDisplay'
import { resolveImageUrl } from '../../utils/images'

const DEFAULT_SORT = 'price'

type Props = {
  open: boolean
  title: string
  items: HotelExtraItem[]
  selectedId?: string
  passengers: number
  entityType: CatalogEntityType
  category: string
  imageUrlForItem: (item: HotelExtraItem) => string
  isFavorite: (itemId: string) => boolean
  onToggleFavorite: (item: HotelExtraItem, imageUrl: string) => void
  onClose: () => void
  onSelect: (itemId: string) => void
}

export function DetailExtraPickerPanel({
  open,
  title,
  items,
  selectedId,
  passengers,
  entityType,
  category,
  imageUrlForItem,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelect,
}: Props) {
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSortBy(DEFAULT_SORT)
      setExpandedId(null)
    }
  }, [open])

  const sorted = useMemo(() => {
    const list = [...items]
    if (sortBy === 'price_desc') list.sort((a, b) => b.estimated_cost - a.estimated_cost)
    else if (sortBy === 'rating') {
      list.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
    } else list.sort((a, b) => a.estimated_cost - b.estimated_cost)
    return list
  }, [items, sortBy])

  const expandedItem = expandedId ? sorted.find((item) => item.id === expandedId) : null

  function priceMeta(item: HotelExtraItem) {
    const unitCost = item.estimated_cost
    if (unitCost <= 0) return 'Включено в маршрут'
    return passengers > 1
      ? `${formatPrice(unitCost, 'rub', true)}/чел · ${passengers} чел.`
      : `${formatPrice(unitCost, 'rub', true)}/чел`
  }

  function priceLabel(item: HotelExtraItem) {
    const totalCost = item.estimated_cost * Math.max(1, passengers)
    return item.estimated_cost > 0 ? formatPrice(totalCost, 'rub', true) : 'Бесплатно'
  }

  return (
    <ModalPanel title={title} open={open} onClose={onClose} size="lg">
      <div className={`pickerStage${expandedItem ? ' pickerStage--detail' : ''}`}>
        <div className="pickerStage__list">
          <div className="modalPanel__toolbar">
            <FilterToolbar
              sortValue={sortBy}
              onSortChange={setSortBy}
              sortOptions={[
                { value: 'price', label: 'Дешевле' },
                { value: 'price_desc', label: 'Дороже' },
                { value: 'rating', label: 'По рейтингу' },
              ]}
              onReset={() => setSortBy(DEFAULT_SORT)}
            />
          </div>
          <div className="roomCatalog detailExtraCatalog detailExtraCatalog--modal">
            {sorted.map((item) => {
              const active = selectedId === item.id
              const image = resolveImageUrl(imageUrlForItem(item))
              return (
                <article
                  key={item.id}
                  className={`roomCard detailExtraCard detailExtraCard--expandable${active ? ' detailExtraCard--active' : ''}`}
                >
                  <div className="detailExtraCard__galleryWrap">
                    <button
                      type="button"
                      className="detailExtraCard__open"
                      onClick={() => setExpandedId(item.id)}
                    >
                      <div className="roomCard__gallery" aria-hidden>
                        <PhotoSlider
                          images={image ? [image] : []}
                          variant="card"
                          autoMs={4500}
                        />
                      </div>
                      <div className="roomCard__body">
                        <div className="roomCard__head">
                          <h3 className="roomCard__title">{item.title}</h3>
                          {item.average_rating != null ? (
                            <StarRating
                              value={item.average_rating}
                              showValue
                              reviewCount={item.review_count}
                            />
                          ) : null}
                          <p className="roomCard__description">{item.description}</p>
                        </div>
                        <div className="roomCard__priceRow">
                          <div>
                            <span className="roomCard__price">{priceLabel(item)}</span>
                            <span className="roomCard__priceMeta">{priceMeta(item)}</span>
                          </div>
                          <span className="detailExtraCard__more">Подробнее →</span>
                        </div>
                      </div>
                    </button>
                    <FavoriteButton
                      active={isFavorite(item.id)}
                      onClick={() => onToggleFavorite(item, image ?? '')}
                      size="sm"
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {expandedItem ? (
          <div className="pickerStage__detail">
            <PickerItemDetailView
              title={expandedItem.title}
              description={expandedItem.description}
              images={[resolveImageUrl(imageUrlForItem(expandedItem))].filter(
                (url): url is string => Boolean(url)
              )}
              priceLabel={priceLabel(expandedItem)}
              priceMeta={priceMeta(expandedItem)}
              entityType={entityType}
              entityId={expandedItem.id}
              category={category}
              averageRating={expandedItem.average_rating}
              reviewCount={expandedItem.review_count}
              selected={selectedId === expandedItem.id}
              favoriteActive={isFavorite(expandedItem.id)}
              onToggleFavorite={() =>
                onToggleFavorite(
                  expandedItem,
                  resolveImageUrl(imageUrlForItem(expandedItem)) ?? ''
                )
              }
              onBack={() => setExpandedId(null)}
              onSelect={() => onSelect(expandedItem.id)}
            />
          </div>
        ) : null}
      </div>
    </ModalPanel>
  )
}
