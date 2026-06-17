import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
}

export function ModalPanel({ title, open, onClose, children, size = 'lg' }: Props) {
  useEffect(() => {
    if (!open) return

    document.body.classList.add('panel-open')
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('panel-open')
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modalPanelOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-panel-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={`modalPanel modalPanel--${size}`}>
        <header className="modalPanel__header">
          <div className="modalPanel__headings">
            <h2 id="modal-panel-title" className="modalPanel__title">
              {title}
            </h2>
          </div>
          <button type="button" className="modalPanel__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>
        <div className="modalPanel__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}
