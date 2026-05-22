import { useState } from 'react'
import '../App.css'

type Props = {
  onSuccess: (token: string) => void
  onGoRegister: () => void
}

const API_BASE = 'http://localhost:8000/api/v1'

export function LoginPage({ onSuccess, onGoRegister }: Props) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!login || !password) { setError('Заполните все поля'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })
      const text = await res.text()
      let data: { detail?: string | { msg: string }[] } = {}
      if (text) {
        try {
          data = JSON.parse(text) as typeof data
        } catch {
          setError(res.ok ? 'Неверный ответ сервера' : `Ошибка сервера (${res.status})`)
          return
        }
      }
      if (!res.ok) {
        setError(
          typeof data.detail === 'string'
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((e: { msg: string }) => e.msg).join(', ')
              : res.status >= 500
                ? 'Ошибка сервера, попробуйте позже'
                : 'Неверный логин или пароль'
        )
        return
      }
      localStorage.setItem('token', data.access_token)
      onSuccess(data.access_token)
    } catch {
      setError('Нет связи с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authPage">
      <header className="topBar">
        <div className="topBarInner">
          <span className="logo">AI TRAVELER</span>
        </div>
      </header>

      <div className="authBody">
        <div className="authCard">
          <h1 className="authTitle">Авторизация</h1>

          {error && <div className="authError">{error}</div>}

          <div className="authField">
            <input
              type="text"
              placeholder="Логин"
              value={login}
              onChange={e => setLogin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
            />
          </div>

          <div className="authField">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
            />
          </div>

          <button
            type="button"
            className="authBtn"
            disabled={loading}
            onClick={() => void handleSubmit()}
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>

          <button type="button" className="authLink" onClick={onGoRegister}>
            Ещё не зарегистрированы?
          </button>
        </div>
      </div>

      <footer className="footer">
        <span>AI TRAVELER</span>
        <span>Users 4.2k &nbsp; Trips 730 &nbsp; Avg $1280</span>
      </footer>
    </div>
  )
}
