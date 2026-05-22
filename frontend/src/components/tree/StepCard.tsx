import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  visible: boolean
  delayMs?: number
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  imageUrl?: string | null
  children?: ReactNode
}

export function StepCard({
  title,
  subtitle,
  visible,
  delayMs = 0,
  selected,
  onClick,
  disabled,
  imageUrl,
  children,
}: Props) {
  return (
    <div
      className={`stepCardWrap${visible ? ' stepCardWrap--visible' : ''}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <button
        type="button"
        className={`stepCard${selected ? ' stepCard--selected' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        <div
          className="stepCard__media"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          {!imageUrl ? <span className="stepCard__mediaPlaceholder">Фото</span> : null}
        </div>
        <div className="stepCard__body">
          <span className="stepCard__title">{title}</span>
          {subtitle ? <span className="stepCard__subtitle">{subtitle}</span> : null}
        </div>
      </button>
      {children}
    </div>
  )
}
