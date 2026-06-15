type Props = {
  loading: boolean
  onDetailize: () => void
  onSaveAsIs: () => void
}

export function DetailOfferCard({ loading, onDetailize, onSaveAsIs }: Props) {
  return (
    <div className="builderOffer">
      <div className="builderOffer__text">
        <p className="builderOffer__title">Основа поездки собрана</p>
        <p className="builderOffer__hint">
          Хотите детализировать путешествие? Можно добавить места рядом с отелем и транспорт по
          городу — или сохранить поездку как есть.
        </p>
      </div>
      <div className="builderOffer__actions">
        <button
          type="button"
          className="btn btnAccent builderOffer__primary"
          disabled={loading}
          onClick={onDetailize}
        >
          Детализировать →
        </button>
        <button
          type="button"
          className="btn btnGhost builderOffer__secondary"
          disabled={loading}
          onClick={onSaveAsIs}
        >
          Сохранить как есть
        </button>
      </div>
    </div>
  )
}
