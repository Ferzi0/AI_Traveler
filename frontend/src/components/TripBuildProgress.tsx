type Props = {
  selectedHotelId: string
  selectedRoomId: string
  selectedTransportId: string
  selectedTransportExtraIds: Record<string, string>
}

const STEPS = [
  { key: 'hotel', label: 'Отель' },
  { key: 'room', label: 'Номер' },
  { key: 'flight', label: 'Рейс' },
  { key: 'baggage', label: 'Багаж' },
  { key: 'refund', label: 'Возврат' },
] as const

export function TripBuildProgress({
  selectedHotelId,
  selectedRoomId,
  selectedTransportId,
  selectedTransportExtraIds,
}: Props) {
  const doneByKey: Record<string, boolean> = {
    hotel: Boolean(selectedHotelId),
    room: Boolean(selectedRoomId),
    flight: Boolean(selectedTransportId),
    baggage: Boolean(selectedTransportExtraIds.baggage),
    refund: Boolean(selectedTransportExtraIds.refund_policy),
  }

  const completed = STEPS.filter((step) => doneByKey[step.key]).length
  const percent = Math.round((completed / STEPS.length) * 100)

  return (
    <div className="tripBuildProgress" aria-label={`Собрано ${completed} из ${STEPS.length} шагов`}>
      <div className="tripBuildProgress__head">
        <span className="tripBuildProgress__title">Сборка поездки</span>
        <span className="tripBuildProgress__count">
          {completed}/{STEPS.length}
        </span>
      </div>
      <div className="tripBuildProgress__track" aria-hidden="true">
        <span className="tripBuildProgress__fill" style={{ width: `${percent}%` }} />
      </div>
      <ol className="tripBuildProgress__steps">
        {STEPS.map((step) => {
          const done = doneByKey[step.key]
          return (
            <li
              key={step.key}
              className={`tripBuildProgress__step${done ? ' tripBuildProgress__step--done' : ''}`}
            >
              <span className="tripBuildProgress__dot" aria-hidden="true" />
              {step.label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
