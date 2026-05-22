import { useCallback, useEffect, useState } from 'react'
import type { TransportItinerary } from '../../types/trip'
import { formatCatalogPerPersonCost, roundMoney } from '../../utils/cost'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'

export type FlightSearchFilters = {
  sort_by: string
  price_from: number | null
  price_to: number | null
}

const DEFAULT_FILTERS: FlightSearchFilters = {
  sort_by: 'price',
  price_from: null,
  price_to: null,
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

type Props = {
  open: boolean
  onClose: () => void
  passengers: number
  onSearch: (filters: FlightSearchFilters) => Promise<TransportItinerary[]>
  onSelect: (itineraryId: string) => void
  onDetails?: (item: TransportItinerary) => void
  loading?: boolean
}

export function FlightExplorerPanel({
  open,
  onClose,
  passengers,
  onSearch,
  onSelect,
  onDetails,
  loading,
}: Props) {
  const [filters, setFilters] = useState<FlightSearchFilters>(DEFAULT_FILTERS)
  const [items, setItems] = useState<TransportItinerary[]>([])
  const [searching, setSearching] = useState(false)

  const runSearch = useCallback(
    async (next: FlightSearchFilters) => {
      setSearching(true)
      try {
        setItems(await onSearch(next))
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

  return (
    <FullscreenPanel title="Рейсы" open={open} onClose={onClose}>
      <FilterToolbar
        sortValue={filters.sort_by}
        onSortChange={(v) => {
          const next = { ...filters, sort_by: v }
          setFilters(next)
          void runSearch(next)
        }}
        sortOptions={[
          { value: 'price', label: 'Дешевле' },
          { value: 'price_desc', label: 'Дороже' },
          { value: 'duration', label: 'Быстрее' },
          { value: '-duration', label: 'Дольше в пути' },
        ]}
        onReset={resetFilters}
      >
        <div className="filterToolbar__filters filterToolbar__filters--inline">
          <label>
            Цена от $
            <input
              type="number"
              min={0}
              value={filters.price_from ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? null : Number(e.target.value)
                const next = { ...filters, price_from: v }
                setFilters(next)
                void runSearch(next)
              }}
            />
          </label>
          <label>
            до $
            <input
              type="number"
              min={0}
              value={filters.price_to ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? null : Number(e.target.value)
                const next = { ...filters, price_to: v }
                setFilters(next)
                void runSearch(next)
              }}
            />
          </label>
        </div>
      </FilterToolbar>

      <div className="catalogList">
        {(searching || loading) && items.length === 0 ? <p className="panelHint">Загрузка…</p> : null}
        {items.map((item) => (
          <div key={item.itinerary_id} className="catalogCard catalogCard--row catalogCard--flight">
            <div className="catalogCard__media catalogCard__media--small">
              <span>✈</span>
            </div>
            <div className="catalogCard__body">
              <strong>{item.outbound.title.replace('Авиаперелет ', '')}</strong>
              {item.inbound ? (
                <span className="catalogCard__meta">Обратно: {item.inbound.title.replace('Авиаперелет ', '')}</span>
              ) : null}
              <span className="catalogCard__meta">
                {formatCatalogPerPersonCost(
                  roundMoney(item.total_price / Math.max(1, passengers)),
                  passengers
                )}{' '}
                · {formatDuration(item.total_duration_min)}
              </span>
            </div>
            <div className="catalogCard__actions">
              {onDetails ? (
                <button type="button" className="btn btnGhost" onClick={() => onDetails(item)}>
                  Детали
                </button>
              ) : null}
              <button type="button" className="btn" onClick={() => onSelect(item.itinerary_id)}>
                Выбрать
              </button>
            </div>
          </div>
        ))}
        {!searching && items.length === 0 ? <p className="panelHint">Нет рейсов</p> : null}
      </div>
    </FullscreenPanel>
  )
}
