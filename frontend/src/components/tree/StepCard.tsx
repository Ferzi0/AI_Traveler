import type { ReactNode } from 'react'
import { FavoriteButton } from '../FavoriteButton'
import { imageBackgroundStyle } from '../../utils/images'

type Props = {
  nodeId?: string
  variant?: 'photo' | 'flow'
  title: string
  subtitle?: string
  visible: boolean
  delayMs?: number
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  imageUrl?: string | null
  children?: ReactNode
  favoriteActive?: boolean
  onFavoriteToggle?: () => void
}

export function StepCard({
  nodeId,
  variant = 'photo',
  title,
  subtitle,
  visible,
  delayMs = 0,
  selected,
  onClick,
  disabled,
  imageUrl,
  children,
  favoriteActive,
  onFavoriteToggle,
}: Props) {
  const isFlow = variant === 'flow'
  const showPhoto = !isFlow && (imageUrl || onFavoriteToggle)

  return (
    <div
      className={`stepCardWrap${visible ? ' stepCardWrap--visible' : ''}${isFlow ? ' stepCardWrap--flow' : ''}`}
      style={{ transitionDelay: `${delayMs}ms` }}
      data-tree-node={nodeId}
    >
      {nodeId ? (
        <>
          <span
            className="stepCard__anchor"
            data-tree-node={nodeId}
            data-tree-anchor="top"
          />
          <span
            className="stepCard__anchor"
            data-tree-node={nodeId}
            data-tree-anchor="bottom"
          />
          <span
            className="stepCard__anchor"
            data-tree-node={nodeId}
            data-tree-anchor="left"
          />
          <span
            className="stepCard__anchor"
            data-tree-node={nodeId}
            data-tree-anchor="right"
          />
        </>
      ) : null}
      <button
        type="button"
        className={`stepCard${selected ? ' stepCard--selected' : ''}${isFlow ? ' stepCard--flow' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        {showPhoto ? (
          <div
            className="stepCard__media"
            style={imageBackgroundStyle(imageUrl)}
          >
            {!imageUrl ? <span className="stepCard__mediaPlaceholder">Фото</span> : null}
            {onFavoriteToggle ? (
              <FavoriteButton
                active={Boolean(favoriteActive)}
                onClick={() => onFavoriteToggle()}
                size="sm"
              />
            ) : null}
          </div>
        ) : null}
        {isFlow && onFavoriteToggle ? (
          <FavoriteButton
            active={Boolean(favoriteActive)}
            onClick={() => onFavoriteToggle()}
            size="sm"
          />
        ) : null}
        <div className="stepCard__body">
          <span className="stepCard__title">{title}</span>
          {subtitle ? <span className="stepCard__subtitle">{subtitle}</span> : null}
        </div>
      </button>
      {children}
    </div>
  )
}
