import { useState } from 'react'

type Props = {
  userId: number
  onClose: () => void
  onLogout: () => void
}

export function ProfilePage({ userId, onClose, onLogout }: Props) {
  const [name, setName] = useState('Эдуард Матвеев')
  const [email, setEmail] = useState('user@example.com')
  const [homeCity, setHomeCity] = useState('Москва')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // Здесь будет PATCH /users/{userId} когда появится эндпоинт
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
          <h1 className="pageTitle">Профиль</h1>

          <div className="profileCard">
            <div className="profileAvatar">{name.charAt(0)}</div>
            <div className="profileMeta">
              <span className="profileName">{name}</span>
              <span className="profileSub">ID: {userId}</span>
            </div>
          </div>

          <div className="profileForm">
            <div className="profileField">
              <label htmlFor="profileName">Имя</label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="profileField">
              <label htmlFor="profileEmail">Email</label>
              <input
                id="profileEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="profileField">
              <label htmlFor="profileCity">Город вылета по умолчанию</label>
              <input
                id="profileCity"
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
              />
            </div>

            <div className="profileActions">
              <button type="button" className="btn btnAccent" onClick={handleSave}>
                {saved ? 'Сохранено ✓' : 'Сохранить'}
              </button>
              <button type="button" className="btn btnDanger" onClick={onLogout}>
                Выйти из аккаунта
              </button>
            </div>
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
