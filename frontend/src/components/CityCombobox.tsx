import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { RUSSIAN_CITIES } from '../data/russianCities'

const MAX_RESULTS = 80

type Props = {
  id?: string
  value: string
  onChange: (city: string) => void
  cities?: readonly string[]
}

function filterCities(cities: readonly string[], query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const startsWith: string[] = []
  const contains: string[] = []
  for (const city of cities) {
    const lower = city.toLowerCase()
    if (lower.startsWith(q)) startsWith.push(city)
    else if (lower.includes(q)) contains.push(city)
  }
  return [...startsWith, ...contains].slice(0, MAX_RESULTS)
}

function HighlightMatch({ city, query }: { city: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{city}</>

  const lowerCity = city.toLowerCase()
  const lowerQ = q.toLowerCase()
  const index = lowerCity.indexOf(lowerQ)
  if (index < 0) return <>{city}</>

  return (
    <>
      {city.slice(0, index)}
      <mark className="cityCombobox__mark">{city.slice(index, index + q.length)}</mark>
      {city.slice(index + q.length)}
    </>
  )
}

export function CityCombobox({ id, value, onChange, cities = RUSSIAN_CITIES }: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const filtered = useMemo(() => filterCities(cities, query), [cities, query])
  const hasMore = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return false
    let count = 0
    for (const city of cities) {
      if (city.toLowerCase().includes(q)) count += 1
    }
    return count > MAX_RESULTS
  }, [cities, query])

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

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

  function commitCity(city: string) {
    onChange(city)
    setQuery(city)
    setOpen(false)
  }

  function handleBlur() {
    window.setTimeout(() => {
      if (cities.includes(query)) {
        if (query !== value) onChange(query)
      } else {
        setQuery(value)
      }
      setOpen(false)
    }, 120)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true)
      return
    }

    if (event.key === 'Escape') {
      setQuery(value)
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
      commitCity(filtered[highlightIndex])
    }
  }

  return (
    <div
      ref={rootRef}
      className={`cityCombobox${open ? ' cityCombobox--open' : ''}`}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        className="cityCombobox__input"
        value={query}
        placeholder="Введите город"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          inputRef.current?.select()
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <span className="cityCombobox__chevron" aria-hidden>
        ▾
      </span>

      {open ? (
        <div className="cityCombobox__dropdown" role="listbox" id={listId}>
          {filtered.length === 0 ? (
            <p className="cityCombobox__empty">
              {query.trim() ? 'Город не найден' : 'Введите несколько букв названия'}
            </p>
          ) : (
            <ul className="cityCombobox__list">
              {filtered.map((city, index) => (
                <li key={city}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={city === value}
                    className={
                      index === highlightIndex
                        ? 'cityCombobox__option cityCombobox__option--active'
                        : 'cityCombobox__option'
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => commitCity(city)}
                  >
                    <HighlightMatch city={city} query={query} />
                  </button>
                </li>
              ))}
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
