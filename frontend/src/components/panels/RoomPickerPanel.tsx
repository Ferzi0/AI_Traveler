import { useCallback, useEffect, useRef, useState } from 'react'
import type { RoomItem } from '../../types/trip'
import { formatPrice } from '../../utils/flightDisplay'
import { useAsyncSearchSeq } from '../../hooks/useAsyncSearchSeq'
import { PhotoSlider } from '../PhotoSlider'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'

const DEFAULT_SORT = 'price'

type Props = {
  open: boolean
  hotelTitle: string
  onClose: () => void
  onSearch: (sortBy: string) => Promise<RoomItem[]>
  onSelect: (roomId: string, accommodationId: string) => void
  loading?: boolean
}

export function RoomPickerPanel({ open, hotelTitle, onClose, onSearch, onSelect, loading }: Props) {
  const { nextSeq, isLatest } = useAsyncSearchSeq()
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch
  const [sortBy, setSortBy] = useState(DEFAULT_SORT)
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [searching, setSearching] = useState(false)

  const runSearch = useCallback(
    async (sort: string) => {
      const seq = nextSeq()
      setSearching(true)
      try {
        const result = await onSearchRef.current(sort)
        if (!isLatest(seq)) return
        setRooms(result)
      } finally {
        if (isLatest(seq)) setSearching(false)
      }
    },
    [isLatest, nextSeq]
  )

  useEffect(() => {
    if (!open) {
      setSortBy(DEFAULT_SORT)
      setRooms([])
      return
    }
    setSortBy(DEFAULT_SORT)
    void runSearch(DEFAULT_SORT)
  }, [open, runSearch])

  function resetFilters() {
    setSortBy(DEFAULT_SORT)
    void runSearch(DEFAULT_SORT)
  }

  return (
    <FullscreenPanel title={`Номера · ${hotelTitle}`} open={open} onClose={onClose}>
      <FilterToolbar
        sortValue={sortBy}
        onSortChange={(v) => {
          setSortBy(v)
          void runSearch(v)
        }}
        sortOptions={[
          { value: 'price', label: 'Дешевле' },
          { value: 'price_desc', label: 'Дороже' },
        ]}
        onReset={resetFilters}
      />
      <div className="roomCatalog">
        {(searching || loading) && rooms.length === 0 ? (
          <p className="panelHint">Загрузка…</p>
        ) : null}
        {rooms.map((room) => (
          <article key={room.room_id} className="roomCard">
            <div
              className="roomCard__gallery"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              <PhotoSlider images={room.image_urls} variant="card" autoMs={4500} />
            </div>
            <div className="roomCard__body">
              <div className="roomCard__head">
                <h3 className="roomCard__title">{room.room_name}</h3>
                <p className="roomCard__description">{room.description}</p>
              </div>
              <div className="roomCard__facts">
                <span>{room.area_sqm} м²</span>
                <span>{room.bed_type}</span>
                <span>{room.view}</span>
              </div>
              <div className="roomCard__amenities">
                {room.amenities.map((item) => (
                  <span key={item} className="roomCard__tag">
                    {item}
                  </span>
                ))}
              </div>
              <div className="roomCard__guests">
                До {room.max_persons} гостей · {room.persons} в поездке · {room.nights} ноч.
              </div>
              <div className="roomCard__priceRow">
                <div>
                  <span className="roomCard__price">{formatPrice(room.price_total, 'rub', true)}</span>
                  <span className="roomCard__priceMeta">
                    {formatPrice(room.price_per_night, 'rub', true)}/ночь · всего за {room.nights} ноч.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn roomCard__selectBtn"
                  onClick={() => onSelect(room.room_id, room.accommodation_id)}
                >
                  Выбрать
                </button>
              </div>
            </div>
          </article>
        ))}
        {!searching && rooms.length === 0 ? <p className="panelHint">Нет номеров</p> : null}
      </div>
    </FullscreenPanel>
  )
}
