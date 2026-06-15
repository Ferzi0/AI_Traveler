import { useCallback, useEffect, useState } from 'react'
import { FavoriteButton } from '../FavoriteButton'
import type { AccommodationItem, AccommodationSearchResponse } from '../../types/trip'
import { imageBackgroundStyle } from '../../utils/images'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'
import { HotelMap } from './HotelMap'

export type HotelSearchFilters = {
  sort_by: string
  stars_min: number
  stars_max: number
  breakfast_included: boolean
  has_pool: boolean
}

const DEFAULT_FILTERS: HotelSearchFilters = {
  sort_by: 'price',
  stars_min: 1,
  stars_max: 5,
  breakfast_included: false,
  has_pool: false,
}

type Props = {
  open: boolean
  onClose: () => void
  onSearch: (filters: HotelSearchFilters) => Promise<AccommodationSearchResponse>
  onSelect: (hotelId: string) => void
  loading?: boolean
  isFavorite: (hotelId: string) => boolean
  onToggleFavorite: (hotel: AccommodationItem) => void
}

export function HotelExplorerPanel({
  open,
  onClose,
  onSearch,
  onSelect,
  loading,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const [filters, setFilters] = useState<HotelSearchFilters>(DEFAULT_FILTERS)
  const [items, setItems] = useState<AccommodationItem[]>([])
  const [mapCenter, setMapCenter] = useState({ latitude: 0, longitude: 0 })
  const [activeId, setActiveId] = useState('')
  const [searching, setSearching] = useState(false)

  const runSearch = useCallback(
    async (next: HotelSearchFilters) => {
      setSearching(true)
      try {
        const res = await onSearch(next)
        setItems(res.items)
        setMapCenter(res.map_center)
      } finally {
        setSearching(false)
      }
    },
    [onSearch]
  )

  useEffect(() => {
    if (!open) return
    void runSearch(filters)
  }, [open])

  function resetFilters() {
    const next = { ...DEFAULT_FILTERS }
    setFilters(next)
    void runSearch(next)
  }

  function applyFilter<K extends keyof HotelSearchFilters>(key: K, value: HotelSearchFilters[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    void runSearch(next)
  }

  return (
    <FullscreenPanel title="Отели" open={open} onClose={onClose}>
      <FilterToolbar
        sortValue={filters.sort_by}
        onSortChange={(v) => applyFilter('sort_by', v)}
        sortOptions={[
          { value: 'price', label: 'Дешевле' },
          { value: 'price_desc', label: 'Дороже' },
          { value: 'rating', label: 'По рейтингу' },
        ]}
        onReset={resetFilters}
      >
        <div className="filterToolbar__filters">
          <label className="filterRange">
            Звёзды от {filters.stars_min} до {filters.stars_max}
            <input
              type="range"
              min={1}
              max={5}
              value={filters.stars_min}
              onChange={(e) => applyFilter('stars_min', Number(e.target.value))}
            />
            <input
              type="range"
              min={1}
              max={5}
              value={filters.stars_max}
              onChange={(e) => applyFilter('stars_max', Number(e.target.value))}
            />
          </label>
          <label className="filterCheck">
            <input
              type="checkbox"
              checked={filters.breakfast_included}
              onChange={(e) => applyFilter('breakfast_included', e.target.checked)}
            />
            Завтрак включён
          </label>
          <label className="filterCheck">
            <input
              type="checkbox"
              checked={filters.has_pool}
              onChange={(e) => applyFilter('has_pool', e.target.checked)}
            />
            Бассейн
          </label>
        </div>
      </FilterToolbar>

      <div className="hotelExplorer">
        <div className="hotelExplorer__list">
          {(searching || loading) && items.length === 0 ? (
            <p className="panelHint">Загрузка…</p>
          ) : null}
          {items.map((hotel) => (
            <button
              key={hotel.id}
              type="button"
              className={`catalogCard${activeId === hotel.id ? ' catalogCard--active' : ''}`}
              onMouseEnter={() => setActiveId(hotel.id)}
              onClick={() => onSelect(hotel.id)}
            >
              <div
                className="catalogCard__media"
                style={imageBackgroundStyle(hotel.image_url)}
              >
                {!hotel.image_url ? <span>Фото</span> : null}
                <FavoriteButton
                  active={isFavorite(hotel.id)}
                  onClick={() => onToggleFavorite(hotel)}
                  size="sm"
                />
              </div>
              <div className="catalogCard__body">
                <strong>{hotel.title}</strong>
                <span className="catalogCard__meta">
                  {'★'.repeat(hotel.stars)} · ${hotel.price}/ночь
                </span>
                <span className="catalogCard__tags">
                  {hotel.breakfast_included ? 'Завтрак' : null}
                  {hotel.has_pool ? ' · Бассейн' : null}
                </span>
              </div>
            </button>
          ))}
          {!searching && items.length === 0 ? (
            <p className="panelHint">Нет отелей по фильтрам</p>
          ) : null}
        </div>
        <div className="hotelExplorer__map">
          <HotelMap
            center={mapCenter}
            hotels={items}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id)
              onSelect(id)
            }}
          />
        </div>
      </div>
    </FullscreenPanel>
  )
}
