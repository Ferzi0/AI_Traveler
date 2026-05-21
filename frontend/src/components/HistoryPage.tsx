type TripCard = {
  id: number
  destination: string
  hotel: string
  date: string
  total: number
}

// Заглушка — потом заменишь на реальный запрос GET /trips
const MOCK_HISTORY: TripCard[] = [
  { id: 1, destination: 'Пхукет', hotel: 'Laguna Resort', date: '12.05.2022', total: 1900 },
  { id: 2, destination: 'Пхукет', hotel: 'Hostel Central', date: '14.07.2023', total: 2040 },
  { id: 3, destination: 'Лондон', hotel: 'Holiday Inn', date: '26.02.2025', total: 2180 },
]

type Props = {
  onClose: () => void
  onOpen: (tripId: number) => void
}

export function HistoryPage({ onClose, onOpen }: Props) {
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

          <div className="historyList">
            {MOCK_HISTORY.map((trip) => (
              <button
                key={trip.id}
                type="button"
                className="historyCard"
                onClick={() => onOpen(trip.id)}
              >
                <div className="historyCardContent">
                  <span className="historyCardTitle">
                    {trip.destination} · {trip.hotel} · {trip.date}
                  </span>
                  <span className="historyCardSub">Итог: ${trip.total}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <footer className="footer">
          <span>AI TRAVELER</span>
          <span>Users 4.2k &nbsp; Trips 730 &nbsp; Avg $1280</span>
        </footer>
      </div>
    </div>
  )
}
