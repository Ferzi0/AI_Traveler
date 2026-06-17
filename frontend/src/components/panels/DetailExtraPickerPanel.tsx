import { useEffect, useMemo, useState } from 'react'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'
import type { HotelExtraItem } from '../../types/trip'
import { formatPrice } from '../../utils/flightDisplay'
import { resolveImageUrl } from '../../utils/images'
import { PhotoSlider } from '../PhotoSlider'

const DEFAULT_SORT = 'price'

type Props = {
  open: boolean
  title: string
  items: HotelExtraItem[]
  selectedId?: string
  passengers: number
  imageUrlForItem: (item: HotelExtraItem) => string
  onClose: () => void
  onSelect: (itemId: string) => void
}

export function DetailExtraPickerPanel({
  open,
  title,
  items,
  selectedId,
  passengers,
  imageUrlForItem,
  onClose,
  onSelect,
}: Props) {
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)

  useEffect(() => {
    if (!open) setSortBy(DEFAULT_SORT)
  }, [open])

  const sorted = useMemo(() => {
    const list = [...items]
    if (sortBy === 'price_desc') list.sort((a, b) => b.estimated_cost - a.estimated_cost)
    else list.sort((a, b) => a.estimated_cost - b.estimated_cost)
    return list
  }, [items, sortBy])

  return (
    <FullscreenPanel title={title} open={open} onClose={onClose}>
      <FilterToolbar
        sortValue={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { value: 'price', label: 'Дешевле' },
          { value: 'price_desc', label: 'Дороже' },
        ]}
        onReset={() => setSortBy(DEFAULT_SORT)}
      />
      <div className="roomCatalog detailExtraCatalog">
        {sorted.map((item) => {
          const active = selectedId === item.id
          const unitCost = item.estimated_cost
          const totalCost = unitCost * Math.max(1, passengers)
          return (
            <article
              key={item.id}
              className={`roomCard detailExtraCard${active ? ' detailExtraCard--active' : ''}`}
            >
              <div
                className="roomCard__gallery"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <PhotoSlider
                  images={
                    [resolveImageUrl(imageUrlForItem(item))].filter(
                      (url): url is string => Boolean(url)
                    )
                  }
                  variant="card"
                  autoMs={4500}
                />
              </div>
              <div className="roomCard__body">
                <div className="roomCard__head">
                  <h3 className="roomCard__title">{item.title}</h3>
                  <p className="roomCard__description">{item.description}</p>
                </div>
                <div className="roomCard__priceRow">
                  <div>
                    <span className="roomCard__price">
                      {unitCost > 0
                        ? formatPrice(totalCost, 'rub', true)
                        : 'Бесплатно'}
                    </span>
                    <span className="roomCard__priceMeta">
                      {unitCost > 0
                        ? passengers > 1
                          ? `${formatPrice(unitCost, 'rub', true)}/чел · ${passengers} чел.`
                          : `${formatPrice(unitCost, 'rub', true)}/чел`
                        : 'Включено в маршрут'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`btn roomCard__selectBtn${active ? ' btn--secondary' : ''}`}
                    onClick={() => onSelect(item.id)}
                  >
                    {active ? 'Выбрано' : 'Выбрать'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </FullscreenPanel>
  )
}
