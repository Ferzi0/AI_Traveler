import { useMemo, useState } from 'react'
import { FilterToolbar } from './FilterToolbar'
import { FullscreenPanel } from './FullscreenPanel'
import type { TransportExtraItem } from '../../types/trip'
import { appendCostToSubtitle } from '../../utils/cost'

type Props = {
  open: boolean
  title: string
  items: TransportExtraItem[]
  selectedId?: string
  passengers: number
  onClose: () => void
  onSelect: (itemId: string) => void
}

export function ExtraPickerPanel({
  open,
  title,
  items,
  selectedId,
  passengers,
  onClose,
  onSelect,
}: Props) {
  const [sortBy, setSortBy] = useState('price')
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
        onReset={() => setSortBy('price')}
      />
      <div className="catalogList">
        {sorted.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`catalogCard catalogCard--row${selectedId === item.id ? ' catalogCard--active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <div className="catalogCard__body">
              <strong>{item.title}</strong>
              <span className="catalogCard__meta">
                {appendCostToSubtitle(item.description, item.estimated_cost, passengers)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </FullscreenPanel>
  )
}
