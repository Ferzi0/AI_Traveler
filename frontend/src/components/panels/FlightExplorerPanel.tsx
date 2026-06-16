import { useCallback, useEffect, useRef, useState } from 'react'
import type { TransportItinerary } from '../../types/trip'
import { useAsyncSearchSeq } from '../../hooks/useAsyncSearchSeq'
import { TransportDetailsPanel } from '../TransportDetailsPanel'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'
import {
  airlineLogoUrl,
  durationLabel,
  formatPrice,
  formatTripDates,
  routeLabel,
  transfersLabel,
  tripDaysFromApi,
} from '../../utils/flightDisplay'

export type FlightSearchFilters = {
  sort_by: string
  price_from: number | null
  price_to: number | null
}

export type FlightSearchMeta = {
  origin_iata: string
  destination_iata: string
  origin_label: string
  destination_label: string
  departure_at: string | null
  return_at: string | null
  source: string
  count: number
}

const DEFAULT_FILTERS: FlightSearchFilters = {
  sort_by: 'price',
  price_from: null,
  price_to: null,
}

type SearchResult = {
  items: TransportItinerary[]
  search?: FlightSearchMeta
}

type Props = {
  open: boolean
  onClose: () => void
  passengers: number
  currency?: string
  onSearch: (filters: FlightSearchFilters) => Promise<SearchResult | TransportItinerary[]>
  onSelect: (itineraryId: string) => void
  loading?: boolean
}

function aviasalesUrl(item: TransportItinerary): string | null {
  return item.details.aviasales_url ?? item.details.sources[0]?.url ?? null
}

export function FlightExplorerPanel({
  open,
  onClose,
  passengers,
  currency = 'rub',
  onSearch,
  onSelect,
  loading,
}: Props) {
  const { nextSeq, isLatest } = useAsyncSearchSeq()
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch
  const [filters, setFilters] = useState<FlightSearchFilters>(DEFAULT_FILTERS)
  const [filterFormKey, setFilterFormKey] = useState(0)
  const [items, setItems] = useState<TransportItinerary[]>([])
  const [searchMeta, setSearchMeta] = useState<FlightSearchMeta | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [detailsItem, setDetailsItem] = useState<TransportItinerary | null>(null)

  const runSearch = useCallback(
    async (next: FlightSearchFilters) => {
      const seq = nextSeq()
      setSearching(true)
      setSearchError(null)
      try {
        const result = await onSearchRef.current(next)
        if (!isLatest(seq)) return
        if (Array.isArray(result)) {
          setItems(result)
          setSearchMeta(null)
        } else {
          setItems(result.items)
          setSearchMeta(result.search ?? null)
        }
      } catch (err) {
        if (!isLatest(seq)) return
        setItems([])
        setSearchMeta(null)
        setSearchError(err instanceof Error ? err.message : 'Не удалось загрузить рейсы')
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
      setSearchMeta(null)
      setSearchError(null)
      setDetailsItem(null)
      setFilterFormKey((k) => k + 1)
      return
    }
    const initial = { ...DEFAULT_FILTERS }
    setFilters(initial)
    setFilterFormKey((k) => k + 1)
    void runSearch(initial)
  }, [open, runSearch])

  function applyFilters(next: FlightSearchFilters) {
    setFilters(next)
    void runSearch(next)
  }

  function resetFilters() {
    const next = { ...DEFAULT_FILTERS }
    setFilters(next)
    setFilterFormKey((k) => k + 1)
    void runSearch(next)
  }

  const routeHint = searchMeta
    ? `${searchMeta.origin_label} (${searchMeta.origin_iata}) → ${searchMeta.destination_label} (${searchMeta.destination_iata})`
    : null

  return (
    <FullscreenPanel
      title="Рейсы"
      open={open}
      onClose={onClose}
      overlay={
        detailsItem ? (
          <TransportDetailsPanel
            embedded
            itinerary={detailsItem}
            onClose={() => setDetailsItem(null)}
          />
        ) : null
      }
    >
      <FilterToolbar
        sortValue={filters.sort_by}
        onSortChange={(v) => applyFilters({ ...filters, sort_by: v })}
        sortOptions={[
          { value: 'price', label: 'Дешевле' },
          { value: 'price_desc', label: 'Дороже' },
          { value: 'duration', label: 'Быстрее' },
          { value: '-duration', label: 'Дольше в пути' },
        ]}
        onReset={resetFilters}
      >
        <div key={filterFormKey} className="filterToolbar__filters filterToolbar__filters--inline">
          <label>
            Цена от, ₽
            <input
              type="number"
              min={0}
              value={filters.price_from ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? null : Number(e.target.value)
                applyFilters({ ...filters, price_from: v })
              }}
            />
          </label>
          <label>
            до, ₽
            <input
              type="number"
              min={0}
              value={filters.price_to ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? null : Number(e.target.value)
                applyFilters({ ...filters, price_to: v })
              }}
            />
          </label>
        </div>
      </FilterToolbar>

      {routeHint ? (
        <p className="flightExplorer__meta">
          {routeHint}
          {searchMeta?.departure_at ? ` · ${formatTripDates(searchMeta.departure_at, searchMeta.return_at)}` : ''}
          {searchMeta ? ` · ${searchMeta.count} вариантов · Aviasales` : ''}
        </p>
      ) : null}

      {searchError ? (
        <p className="flightExplorer__error" role="alert">{searchError}</p>
      ) : null}

      <ul className={`flightExplorer__list${searching || loading ? ' flightExplorer__list--loading' : ''}`}>
        {(searching || loading) && items.length === 0 ? (
          <li className="flightExplorer__empty">Загрузка рейсов из Aviasales…</li>
        ) : null}

        {items.map((item) => {
          const details = item.details
          const outboundLeg = details.legs.find((leg) => leg.direction === 'outbound')
          const inboundLeg = details.legs.find((leg) => leg.direction === 'inbound')
          const logo = airlineLogoUrl(outboundLeg?.airline)
          const buyUrl = aviasalesUrl(item)
          const days = tripDaysFromApi(outboundLeg?.departure_at, inboundLeg?.departure_at)
          const duration = durationLabel(item.total_duration_min)
          const origin = details.origin_iata ?? '—'
          const destination = details.destination_iata ?? '—'

          return (
            <li key={item.itinerary_id}>
              <article className="flightExplorer__offer">
                <div className="flightExplorer__main">
                  <div className="flightExplorer__route">
                    <span className="flightExplorer__codes">{routeLabel(origin, destination)}</span>
                    <strong className="flightExplorer__title">{item.outbound.title}</strong>
                    {item.inbound ? (
                      <span className="flightExplorer__return">{item.inbound.title}</span>
                    ) : null}
                  </div>

                  <div className="flightExplorer__facts">
                    <span>{formatTripDates(outboundLeg?.departure_at, inboundLeg?.departure_at)}</span>
                    {days != null ? <span>{days} дн.</span> : null}
                    {duration ? <span>{duration}</span> : null}
                    {outboundLeg?.transfers != null ? (
                      <span className="flightExplorer__chip">{transfersLabel(outboundLeg.transfers)}</span>
                    ) : null}
                    {outboundLeg?.airline ? (
                      <span className="flightExplorer__airline">
                        {logo ? (
                          <img src={logo} alt="" width={20} height={20} className="flightExplorer__logo" />
                        ) : null}
                        {outboundLeg.airline}
                        {outboundLeg.aircraft_model ? ` · ${outboundLeg.aircraft_model}` : ''}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flightExplorer__aside">
                  <div className="flightExplorer__price">
                    <span className="flightExplorer__priceLabel">от {formatPrice(details.price_per_passenger, currency)}</span>
                    <span className="flightExplorer__priceTotal">
                      {formatPrice(item.total_price, currency)} · {passengers} пас.
                    </span>
                  </div>
                  <div className="flightExplorer__actions">
                    <button type="button" className="btn btnGhost" onClick={() => setDetailsItem(item)}>
                      Детали
                    </button>
                    {buyUrl ? (
                      <a
                        href={buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btnAccent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Aviasales ↗
                      </a>
                    ) : null}
                    <button type="button" className="btn" onClick={() => onSelect(item.itinerary_id)}>
                      Выбрать
                    </button>
                  </div>
                </div>
              </article>
            </li>
          )
        })}

        {!searching && !loading && !searchError && items.length === 0 ? (
          <li className="flightExplorer__empty">Рейсы по этому маршруту не найдены</li>
        ) : null}
      </ul>
    </FullscreenPanel>
  )
}
