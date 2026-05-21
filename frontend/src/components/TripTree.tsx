import type { CSSProperties, ReactNode } from 'react'

type TreeNodeProps = {
  title: string
  subtitle?: string
  selected?: boolean
  active?: boolean
  variant?: 'root' | 'branch' | 'leaf'
  onClick?: () => void
  disabled?: boolean
  onDetailsClick?: () => void
}

export function TreeNode({
  title,
  subtitle,
  selected,
  active,
  variant = 'branch',
  onClick,
  disabled,
  onDetailsClick,
}: TreeNodeProps) {
  const className = [
    'treeNode',
    `treeNode--${variant}`,
    selected ? 'treeNode--selected' : '',
    active ? 'treeNode--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`treeNodeWrap${selected ? ' treeNodeWrap--selected' : ''}`}>
      <button type="button" className={className} onClick={onClick} disabled={disabled}>
        <span className="treeNodeTitle">{title}</span>
        {subtitle ? <span className="treeNodeSubtitle">{subtitle}</span> : null}
      </button>
      {selected && onDetailsClick ? (
        <button
          type="button"
          className="treeNodeMore"
          onClick={(event) => {
            event.stopPropagation()
            onDetailsClick()
          }}
        >
          Подробнее
        </button>
      ) : null}
    </div>
  )
}

type TreeLevelProps = {
  children: ReactNode
  columns?: number
}

export function TreeLevel({ children, columns }: TreeLevelProps) {
  const style = columns ? ({ ['--tree-cols' as string]: columns } as CSSProperties) : undefined
  return (
    <div className="treeLevel" style={style}>
      {children}
    </div>
  )
}

type TreeBranchProps = {
  children: ReactNode
}

export function TreeBranch({ children }: TreeBranchProps) {
  return <div className="treeBranch">{children}</div>
}

type TreeConnectorProps = {
  variant?: 'down' | 'split'
  columns?: number
}

export function TreeConnector({ variant = 'down', columns }: TreeConnectorProps) {
  const style = columns ? ({ ['--tree-cols' as string]: columns } as CSSProperties) : undefined
  return <div className={`treeConnector treeConnector--${variant}`} style={style} aria-hidden />
}

type TripTreeProps = {
  children: ReactNode
}

export function TripTree({ children }: TripTreeProps) {
  return <div className="tripTree">{children}</div>
}
