import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  destinationHaystack,
  filterTouristDestinations,
  formatDestinationLabel,
  TOURIST_DESTINATIONS,
  type TouristDestination,
} from '../data/touristDestinations'

const MAX_RESULTS = 80

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect: (destination: TouristDestination) => void
  disabled?: boolean
  placeholder?: string
}

function HighlightLabel({ label, query }: { label: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{label}</>

  const lowerLabel = label.toLowerCase()
  const lowerQ = q.toLowerCase()
  const index = lowerLabel.indexOf(lowerQ)
  if (index < 0) return <>{label}</>

  return (
    <>
      {label.slice(0, index)}
      <mark className="cityCombobox__mark">{label.slice(index, index + q.length)}</mark>
      {label.slice(index + q.length)}
    </>
  )
}

export function DestinationSearch({
  value,
  onChange,
  onSelect,
  disabled = false,
  placeholder = 'Куда летим? Пхукет, Лондон…',
}: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const filtered = useMemo(() => filterTouristDestinations(TOURIST_DESTINATIONS, value), [value])
  const hasMore = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return false
    let count = 0
    for (const dest of TOURIST_DESTINATIONS) {
      if (destinationHaystack(dest).includes(q)) count += 1
    }
    return count > MAX_RESULTS
  }, [value])

  useEffect(() => {
    setHighlightIndex(0)
  }, [value])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function commitDestination(dest: TouristDestination) {
    onChange(dest.title)
    onSelect(dest)
    setOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return

    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true)
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
      return
    }

    if (event.key === 'Enter' && open && filtered[highlightIndex]) {
      event.preventDefault()
      commitDestination(filtered[highlightIndex])
    }
  }

  return (
    <div
      ref={rootRef}
      className={`destinationSearch${open ? ' destinationSearch--open' : ''}`}
    >
      <input
        ref={inputRef}
        type="text"
        className="destinationSearch__input"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {open && !disabled ? (
        <div className="destinationSearch__dropdown cityCombobox__dropdown" role="listbox" id={listId}>
          {filtered.length === 0 ? (
            <p className="cityCombobox__empty">
              {value.trim() ? 'Направление не найдено' : 'Введите несколько букв названия'}
            </p>
          ) : (
            <ul className="cityCombobox__list">
              {filtered.map((dest, index) => {
                const label = formatDestinationLabel(dest)
                return (
                  <li key={`${dest.title}-${dest.country}-${dest.region ?? ''}`}>
                    <button
                      type="button"
                      role="option"
                      className={
                        index === highlightIndex
                          ? 'cityCombobox__option cityCombobox__option--active destinationSearch__option'
                          : 'cityCombobox__option destinationSearch__option'
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => commitDestination(dest)}
                    >
                      <span className="destinationSearch__label">
                        <HighlightLabel label={label} query={value} />
                      </span>
                      <span className="destinationSearch__country">
                        {dest.country}
                        {dest.inCatalog ? (
                          <span className="destinationSearch__badge">Маршрут</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {hasMore ? (
            <p className="cityCombobox__hint">Уточните запрос — показаны первые {MAX_RESULTS}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
