type Props = {
  active: boolean
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
  size?: 'sm' | 'md'
}

export function FavoriteButton({ active, disabled, onClick, size = 'md' }: Props) {
  return (
    <button
      type="button"
      className={`favoriteBtn favoriteBtn--${size}${active ? ' favoriteBtn--active' : ''}`}
      aria-label={active ? 'Убрать из избранного' : 'В избранное'}
      aria-pressed={active}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
    >
      {active ? '♥' : '♡'}
    </button>
  )
}
