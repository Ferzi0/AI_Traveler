import type { ReactNode } from 'react'

type Props = {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function FullscreenPanel({ title, open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fullscreenPanel" role="dialog" aria-modal="true">
      <header className="fullscreenPanel__header">
        <button type="button" className="fullscreenPanel__back" onClick={onClose} aria-label="Назад">
          ←
        </button>
        <h2 className="fullscreenPanel__title">{title}</h2>
      </header>
      <div className="fullscreenPanel__body">{children}</div>
    </div>
  )
}
