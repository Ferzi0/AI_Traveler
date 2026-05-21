type FavoriteItem = {
  id: number
  title: string
  savedAt: string
}

// Заглушка — потом заменишь на реальный запрос GET /favorites
const MOCK_FAVORITES: FavoriteItem[] = [
  { id: 1, title: 'Laguna Phuket', savedAt: 'Сохранено в избранном' },
  { id: 2, title: 'Andaman Grill', savedAt: 'Сохранено в избранном' },
  { id: 3, title: 'Big Buddha', savedAt: 'Сохранено в избранном' },
  { id: 4, title: 'Bosphorus Cruise', savedAt: 'Сохранено в избранном' },
  { id: 5, title: 'Tower of London', savedAt: 'Сохранено в избранном' },
  { id: 6, title: 'West End Show', savedAt: 'Сохранено в избранном' },
]

type Props = {
  onClose: () => void
  onRemove: (id: number) => void
}

export function FavoritesPage({ onClose, onRemove }: Props) {
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
          <h1 className="pageTitle">Избранное</h1>

          {MOCK_FAVORITES.length === 0 ? (
            <p className="emptyTree">Нет сохранённых мест</p>
          ) : (
            <div className="favoritesGrid">
              {MOCK_FAVORITES.map((item) => (
                <div key={item.id} className="favoriteCard">
                  <div className="favoriteCardContent">
                    <span className="favoriteCardTitle">{item.title}</span>
                    <span className="favoriteCardSub">{item.savedAt}</span>
                  </div>
                  <button
                    type="button"
                    className="favoriteRemoveBtn"
                    aria-label="Удалить из избранного"
                    onClick={() => onRemove(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="footer">
          <span>AI TRAVELER</span>
          <span>Users 4.2k &nbsp; Trips 730 &nbsp; Avg $1280</span>
        </footer>
      </div>
    </div>
  )
}
