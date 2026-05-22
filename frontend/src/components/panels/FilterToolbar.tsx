type Props = {
  sortValue: string
  onSortChange: (value: string) => void
  sortOptions: { value: string; label: string }[]
  onReset: () => void
  children?: React.ReactNode
}

export function FilterToolbar({ sortValue, onSortChange, sortOptions, onReset, children }: Props) {
  return (
    <div className="filterToolbar">
      <div className="filterToolbar__row">
        <label className="filterToolbar__label">
          Сортировка
          <select value={sortValue} onChange={(e) => onSortChange(e.target.value)}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btnGhost filterToolbar__reset" onClick={onReset}>
          Сбросить
        </button>
      </div>
      {children ? <div className="filterToolbar__extra">{children}</div> : null}
    </div>
  )
}
