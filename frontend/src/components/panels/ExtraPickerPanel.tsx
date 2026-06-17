import { useEffect, useMemo, useState } from 'react'
import { FilterToolbar } from './FilterToolbar'
import { ModalPanel } from './ModalPanel'
import type { TransportExtraItem } from '../../types/trip'
import { appendCostToSubtitle } from '../../utils/cost'

const DEFAULT_SORT = 'price'

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
    <ModalPanel title={title} open={open} onClose={onClose} size="md">
      <div className="modalPanel__toolbar">
        <FilterToolbar
          sortValue={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { value: 'price', label: 'Дешевле' },
            { value: 'price_desc', label: 'Дороже' },
          ]}
          onReset={() => setSortBy(DEFAULT_SORT)}
        />
      </div>
      <div className="catalogList catalogList--modal">
        {sorted.map((item) => {
          const active = selectedId === item.id
          return (
            <article
              key={item.id}
              className={`catalogCard catalogCard--row catalogCard--extra${active ? ' catalogCard--active' : ''}`}
            >
              <div className="catalogCard__body">
                <strong>{item.title}</strong>
                <span className="catalogCard__meta">
                  {appendCostToSubtitle(item.description, item.estimated_cost, passengers)}
                </span>
              </div>
              <button
                type="button"
                className={`btn catalogCard__pickBtn${active ? ' catalogCard__pickBtn--active' : ' btnAccent'}`}
                onClick={() => onSelect(item.id)}
              >
                {active ? 'Выбрано' : 'Выбрать'}
              </button>
            </article>
          )
        })}
      </div>
    </ModalPanel>
  )
}
