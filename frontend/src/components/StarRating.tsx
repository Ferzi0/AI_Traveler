type Props = {
  value: number
  max?: number
  size?: 'sm' | 'md'
  showValue?: boolean
  reviewCount?: number
}

export function StarRating({
  value,
  max = 5,
  size = 'sm',
  showValue = false,
  reviewCount,
}: Props) {
  const safe = Math.max(0, Math.min(max, value || 0))

  return (
    <span
      className={`starRating starRating--${size}`}
      aria-label={`Рейтинг ${safe.toFixed(1)} из ${max}`}
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = safe >= index + 1
        const half = !filled && safe > index && safe < index + 1
        return (
          <span
            key={index}
            className={`starRating__star${filled ? ' starRating__star--full' : ''}${half ? ' starRating__star--half' : ''}`}
            aria-hidden
          >
            ★
          </span>
        )
      })}
      {showValue ? (
        <span className="starRating__value">
          {safe.toFixed(1)}
          {reviewCount != null && reviewCount > 0 ? ` (${reviewCount})` : ''}
        </span>
      ) : null}
    </span>
  )
}

type InputProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function StarRatingInput({ value, onChange, disabled }: InputProps) {
  return (
    <div className="starRatingInput" role="radiogroup" aria-label="Ваша оценка">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1
        const active = value >= star
        return (
          <button
            key={star}
            type="button"
            className={`starRatingInput__star${active ? ' starRatingInput__star--active' : ''}`}
            disabled={disabled}
            aria-checked={active}
            role="radio"
            onClick={() => onChange(star)}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
