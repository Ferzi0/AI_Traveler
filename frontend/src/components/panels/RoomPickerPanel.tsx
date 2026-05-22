import { useCallback, useEffect, useState } from 'react'
import type { RoomItem } from '../../types/trip'
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
      <div className="catalogList">
        {(searching || loading) && rooms.length === 0 ? <p className="panelHint">Загрузка…</p> : null}
        {rooms.map((room, index) => (
          <button
            key={room.room_id}
            type="button"
            className="catalogCard catalogCard--row"
            onClick={() => onSelect(room.room_id, room.accommodation_id)}
          >
            <div className="catalogCard__media catalogCard__media--small">
              <span>Фото</span>
            </div>
            <div className="catalogCard__body">
              <strong>Номер {index + 1}</strong>
              <span className="catalogCard__meta">{room.room_name}</span>
              <span className="catalogCard__price">${room.price_total} за {room.nights} ноч.</span>
            </div>
          </button>
        ))}
        {!searching && rooms.length === 0 ? <p className="panelHint">Нет номеров</p> : null}
      </div>
    </FullscreenPanel>
  )
}
