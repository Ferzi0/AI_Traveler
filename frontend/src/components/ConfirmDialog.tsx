import { useEffect } from 'react'

type Props = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  error?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  loading = false,
  error,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    document.body.classList.add('panel-open')
    return () => document.body.classList.remove('panel-open')
  }, [])

  return (
    <div className="confirmOverlay" role="dialog" aria-modal="true" aria-labelledby="confirmDialogTitle">
      <div className="confirmDialog">
        <h2 id="confirmDialogTitle" className="confirmDialog__title">
          {title}
        </h2>
        <p className="confirmDialog__message">{message}</p>
        {error ? <p className="confirmDialog__error">{error}</p> : null}
        <div className="confirmDialog__actions">
          <button type="button" className="btn btnGhost confirmDialog__cancel" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn confirmDialog__confirm"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Удаляем…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
