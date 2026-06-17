import { useEffect } from 'react'

type Props = {
  destination?: string | null
  onGoToHistory: () => void
}

export function TripSavedModal({ destination, onGoToHistory }: Props) {
  useEffect(() => {
    document.body.classList.add('panel-open')
    return () => document.body.classList.remove('panel-open')
  }, [])

  return (
    <div className="tripSavedOverlay" role="dialog" aria-modal="true" aria-labelledby="tripSavedTitle">
      <div className="tripSavedModal">
        <div className="tripSavedModal__sparkles" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="tripSavedModal__badge" aria-hidden>
          ✓
        </div>

        <h2 id="tripSavedTitle" className="tripSavedModal__title">
          Спасибо, что выбираете нас!
        </h2>

        <p className="tripSavedModal__lead">
          Маршрут собран, детали сохранены — осталось только отправиться в путь. Пусть рейс будет
          ровным, а приключения — яркими.
        </p>

        {destination ? (
          <p className="tripSavedModal__dest">
            Поездка в <strong>{destination}</strong> уже ждёт вас в истории
          </p>
        ) : null}

        <button type="button" className="btn btnAccent tripSavedModal__cta" onClick={onGoToHistory}>
          Ждём вас снова →
        </button>
      </div>
    </div>
  )
}
