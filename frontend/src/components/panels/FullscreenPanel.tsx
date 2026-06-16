import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  overlay?: ReactNode
}

export function FullscreenPanel({ title, open, onClose, children, overlay }: Props) {
  useEffect(() => {
    if (!open) return

    document.body.classList.add('panel-open')
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.classList.remove('panel-open')
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fullscreenPanel" role="dialog" aria-modal="true">
      <header className="fullscreenPanel__header">
        <button type="button" className="fullscreenPanel__back" onClick={onClose} aria-label="Назад">
          ←
        </button>
        <h2 className="fullscreenPanel__title">{title}</h2>
      </header>
      <div className="fullscreenPanel__body">{children}</div>
      {overlay}
    </div>,
    document.body
  )
}
