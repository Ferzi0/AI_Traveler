import { useCallback, useEffect, useState } from 'react'
import type { RoomItem } from '../../types/trip'
import { PhotoSlider } from '../PhotoSlider'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'

type Props = {
  open: boolean
  hotelTitle: string
  onClose: () => void
  onSearch: (sortBy: string) => Promise<RoomItem[]>
  onSelect: (roomId: string, accommodationId: string) => void
  loading?: boolean
}

export function RoomPickerPanel({ open, hotelTitle, onClose, onSearch, onSelect, loading }: Props) {
  const [sortBy, setSortBy] = useState('price')
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [searching, setSearching] = useState(false)

  const runSearch = useCallback(
    async (sort: string) => {
      setSearching(true)
      try {
        setRooms(await onSearch(sort))
      } finally {
        setSearching(false)
      }
    },
    [onSearch]
  )

  useEffect(() => {
    if (!open) return
    void runSearch(sortBy)
  }, [open])

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
        onReset={() => {
          setSortBy('price')
          void runSearch('price')
        }}
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
                  <span className="roomCard__price">${room.price_total}</span>
                  <span className="roomCard__priceMeta">
                    ${room.price_per_night}/ночь · всего за {room.nights} ноч.
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
