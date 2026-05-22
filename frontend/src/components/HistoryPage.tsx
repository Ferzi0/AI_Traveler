import { useEffect, useState } from 'react'
import { api } from '../api'
import { AppFooter } from './AppFooter'
import type { HistoryDetail, HistoryListItem } from '../types/history'

type Props = {
  onClose: () => void
}

function formatPassengers(n: number | null): string {
  if (!n) return '—'
  if (n === 1) return '1 пассажир'
  if (n >= 2 && n <= 4) return `${n} пассажира`
  return `${n} пассажиров`
}

export function HistoryPage({ onClose }: Props) {
  const [items, setItems] = useState<HistoryListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<HistoryDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const res = await api<{ items: HistoryListItem[] }>('/history')
        setItems(res.items)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function openItem(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
      setDetail(null)
      return
    }
    setExpandedId(id)
    setDetailLoading(true)
    try {
      setDetail(await api<HistoryDetail>(`/history/${id}`))
    } catch {
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="pagePanelOverlay">
      <div className="pagePanel">
        <header className="topBar">
          <div className="topBarInner">
            <span className="logo">AI TRAVELER</span>
            <button type="button" className="menuBtn" aria-label="Закрыть" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        <div className="pagePanelBody">
          <h1 className="pageTitle">История поездок</h1>

          {loading ? <p className="emptyTree">Загрузка…</p> : null}
          {!loading && items.length === 0 ? (
            <p className="emptyTree">Сохранённых поездок пока нет</p>
          ) : null}

          <div className="historyList">
            {items.map((trip) => {
              const expanded = expandedId === trip.id
              const snap = expanded && detail?.id === trip.id ? detail : null
              return (
                <article
                  key={trip.id}
                  className={`historyCard${expanded ? ' historyCard--expanded' : ''}`}
                >
                  <button
                    type="button"
                    className="historyCard__head"
                    onClick={() => void openItem(trip.id)}
                  >
                    <div className="historyCardContent">
                      <span className="historyCardTitle">
                        {trip.destination ?? trip.trip_name}
                        {trip.hotel ? ` · ${trip.hotel}` : ''}
                      </span>
                      <span className="historyCardSub">
                        {trip.date || 'Даты не указаны'} · Итог: {trip.total_label}
                      </span>
                    </div>
                    <span className="historyCard__chevron" aria-hidden>
                      {expanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {expanded ? (
                    <div className="historyCard__body">
                      {detailLoading ? (
                        <p className="panelHint">Загрузка деталей…</p>
                      ) : snap ? (
                        <dl className="historyDetailList">
                          <div>
                            <dt>Откуда</dt>
                            <dd>{snap.origin ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Куда</dt>
                            <dd>{snap.destination ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Даты</dt>
                            <dd>{snap.date || '—'}</dd>
                          </div>
                          <div>
                            <dt>Пассажиры</dt>
                            <dd>{formatPassengers(snap.passengers)}</dd>
                          </div>
                          <div>
                            <dt>Отель</dt>
                            <dd>{snap.hotel ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Номер</dt>
                            <dd>{snap.room ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Рейс</dt>
                            <dd>{snap.flight ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Багаж</dt>
                            <dd>{snap.baggage ?? '—'}</dd>
                          </div>
                          <div>
                            <dt>Возврат</dt>
                            <dd>{snap.refund ?? '—'}</dd>
                          </div>
                          {snap.snapshot?.calculation &&
                          typeof snap.snapshot.calculation === 'object' &&
                          snap.snapshot.calculation !== null &&
                          'items' in snap.snapshot.calculation &&
                          Array.isArray(
                            (snap.snapshot.calculation as { items: unknown[] }).items
                          ) ? (
                            <div className="historyDetailList__breakdown">
                              <dt>Состав суммы</dt>
                              <dd>
                                <ul>
                                  {(
                                    snap.snapshot.calculation as {
                                      items: Array<{ title: string; result: number }>
                                    }
                                  ).items.map((line) => (
                                    <li key={line.title}>
                                      {line.title}: ${line.result}
                                    </li>
                                  ))}
                                </ul>
                              </dd>
                            </div>
                          ) : null}
                        </dl>
                      ) : (
                        <p className="panelHint">Не удалось загрузить детали</p>
                      )}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  )
}
