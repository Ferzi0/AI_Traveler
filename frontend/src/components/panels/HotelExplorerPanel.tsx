import { useCallback, useEffect, useRef, useState } from 'react'
import { FavoriteButton } from '../FavoriteButton'
import { PhotoSlider } from '../PhotoSlider'
import type { AccommodationItem, AccommodationSearchResponse } from '../../types/trip'
import { accommodationGallery } from '../../data/imageCatalog'
import { useAsyncSearchSeq } from '../../hooks/useAsyncSearchSeq'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MOBILE_FLOW_MEDIA } from '../tree/tripFlowLayout'
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

function hotelGallery(hotel: AccommodationItem): string[] {
  return accommodationGallery(hotel)
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
  const isMobile = useMediaQuery(MOBILE_FLOW_MEDIA)
  const { nextSeq, isLatest } = useAsyncSearchSeq()
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch
  const [filters, setFilters] = useState<HotelSearchFilters>(DEFAULT_FILTERS)
  const [filterFormKey, setFilterFormKey] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [items, setItems] = useState<AccommodationItem[]>([])
  const [mapCenter, setMapCenter] = useState({ latitude: 0, longitude: 0 })
  const [activeId, setActiveId] = useState('')
  const [searching, setSearching] = useState(false)

  const runSearch = useCallback(
    async (next: HotelSearchFilters) => {
      const seq = nextSeq()
      setSearching(true)
      try {
        const res = await onSearchRef.current(next)
        if (!isLatest(seq)) return
        setItems(res.items)
        setMapCenter(res.map_center)
      } finally {
        if (isLatest(seq)) setSearching(false)
      }
    },
    [isLatest, nextSeq]
  )

  useEffect(() => {
    if (!open) {
      setFilters({ ...DEFAULT_FILTERS })
      setItems([])
      setActiveId('')
      setFilterFormKey((k) => k + 1)
      return
    }
    const initial = { ...DEFAULT_FILTERS }
    setFilters(initial)
    setFilterFormKey((k) => k + 1)
    void runSearch(initial)
  }, [open, runSearch])

  useEffect(() => {
    if (!open) return
    setFiltersOpen(!isMobile)
  }, [open, isMobile])

  function resetFilters() {
    const next = { ...DEFAULT_FILTERS }
    setFilters(next)
    setFilterFormKey((k) => k + 1)
    void runSearch(next)
  }

  function applyFilters(next: HotelSearchFilters) {
    setFilters(next)
    void runSearch(next)
  }

  function applyStarFilter(which: 'stars_min' | 'stars_max', value: number) {
    let stars_min = filters.stars_min
    let stars_max = filters.stars_max
    if (which === 'stars_min') {
      stars_min = value
      if (stars_min > stars_max) stars_max = stars_min
    } else {
      stars_max = value
      if (stars_max < stars_min) stars_min = stars_max
    }
    applyFilters({ ...filters, stars_min, stars_max })
  }

  function pickHotel(hotel: AccommodationItem) {
    onSelect(hotel.id)
  }

  const filterBlock = (
    <FilterToolbar
      sortValue={filters.sort_by}
      onSortChange={(v) => applyFilters({ ...filters, sort_by: v })}
      sortOptions={[
        { value: 'price', label: 'Дешевле' },
        { value: 'price_desc', label: 'Дороже' },
        { value: 'rating', label: 'По рейтингу' },
      ]}
      onReset={resetFilters}
    >
      <div key={filterFormKey} className="filterToolbar__filters">
        <label className="filterRange">
          Звёзды от {filters.stars_min} до {filters.stars_max}
          <input
            type="range"
            min={1}
            max={5}
            value={filters.stars_min}
            onChange={(e) => applyStarFilter('stars_min', Number(e.target.value))}
          />
          <input
            type="range"
            min={1}
            max={5}
            value={filters.stars_max}
            onChange={(e) => applyStarFilter('stars_max', Number(e.target.value))}
          />
        </label>
        <label className="filterCheck">
          <input
            type="checkbox"
            checked={filters.breakfast_included}
            onChange={(e) => applyFilters({ ...filters, breakfast_included: e.target.checked })}
          />
          Завтрак включён
        </label>
        <label className="filterCheck">
          <input
            type="checkbox"
            checked={filters.has_pool}
            onChange={(e) => applyFilters({ ...filters, has_pool: e.target.checked })}
          />
          Бассейн
        </label>
      </div>
    </FilterToolbar>
  )

  return (
    <FullscreenPanel title="Отели" open={open} onClose={onClose}>
      {isMobile ? (
        <div className="panelFiltersFold">
          <button
            type="button"
            className="panelFiltersFold__toggle"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Фильтры и сортировка
            <span aria-hidden>{filtersOpen ? '▲' : '▼'}</span>
          </button>
          {filtersOpen ? filterBlock : null}
        </div>
      ) : (
        filterBlock
      )}

      <div className="hotelExplorer">
        <div className="hotelExplorer__list">
          {(searching || loading) && items.length === 0 ? (
            <p className="panelHint">Загрузка…</p>
          ) : null}
          {items.map((hotel) => (
            <article
              key={hotel.id}
              className={`catalogCard catalogCard--hotel${activeId === hotel.id ? ' catalogCard--active' : ''}`}
              onMouseEnter={() => setActiveId(hotel.id)}
            >
              <div className="catalogCard__mediaWrap">
                <PhotoSlider images={hotelGallery(hotel)} variant="catalog" autoMs={5000} />
                <button
                  type="button"
                  className="catalogCard__mediaSelect"
                  aria-label={`Выбрать ${hotel.title}`}
                  onClick={() => pickHotel(hotel)}
                />
                <FavoriteButton
                  active={isFavorite(hotel.id)}
                  onClick={() => onToggleFavorite(hotel)}
                  size="sm"
                />
              </div>
              <div className="catalogCard__body">
                <strong className="catalogCard__title">{hotel.title}</strong>
                <span className="catalogCard__meta">
                  {'★'.repeat(hotel.stars)} · ${hotel.price}/ночь
                </span>
                <span className="catalogCard__tags">
                  {hotel.breakfast_included ? 'Завтрак' : null}
                  {hotel.has_pool ? ' · Бассейн' : null}
                </span>
                <button
                  type="button"
                  className="btn btnAccent catalogCard__selectBtn"
                  onClick={() => pickHotel(hotel)}
                >
                  Выбрать
                </button>
              </div>
            </article>
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
