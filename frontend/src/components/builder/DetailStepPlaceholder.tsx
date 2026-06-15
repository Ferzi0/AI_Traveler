type Props = {
  destinationTitle: string
  onBack: () => void
}

export function DetailStepPlaceholder({ destinationTitle, onBack }: Props) {
  return (
    <section className="builderStepPlaceholder" aria-labelledby="builder-detail-title">
      <button type="button" className="btn btnGhost builderStepPlaceholder__back" onClick={onBack}>
        ← Назад к основе
      </button>
      <h2 id="builder-detail-title" className="builderStepPlaceholder__title">
        Детализация · {destinationTitle}
      </h2>
      <p className="builderStepPlaceholder__hint">
        Здесь появится дерево с местами рядом с отелем и транспортом по городу. Пока можно вернуться
        назад и сохранить поездку с уже выбранной основой.
      </p>
      <p className="builderStepPlaceholder__badge">Следующий этап разработки</p>
    </section>
  )
}
