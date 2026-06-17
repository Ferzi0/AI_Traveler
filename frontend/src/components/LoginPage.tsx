import { useState } from 'react'
import { API_BASE } from '../config'
import { AuthPageLayout } from './AuthPageLayout'
import '../App.css'

type Props = {
  onSuccess: (token: string) => void
  onGoRegister: () => void
  onGoHome: () => void
}

export function LoginPage({ onSuccess, onGoRegister, onGoHome }: Props) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!login || !password) { setError('Заполните все поля'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })
      const text = await res.text()
      let data: { access_token?: string; detail?: string | { msg: string }[] } = {}
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
      if (!data.access_token) {
        setError('Неверный ответ сервера')
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
    <AuthPageLayout
      title="С возвращением"
      subtitle="Войдите, чтобы продолжить сборку поездки"
      onGoHome={onGoHome}
      footer={
        <button type="button" className="authLink" onClick={onGoRegister}>
          Ещё не зарегистрированы? Создать аккаунт
        </button>
      }
    >
      {error ? <div className="authError">{error}</div> : null}

      <div className="authField">
        <label className="authField__label" htmlFor="login-input">Логин</label>
        <input
          id="login-input"
          type="text"
          placeholder="Ваш логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
          autoComplete="username"
        />
      </div>

      <div className="authField">
        <label className="authField__label" htmlFor="password-input">Пароль</label>
        <input
          id="password-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
          autoComplete="current-password"
        />
      </div>

      <button
        type="button"
        className="authBtn"
        disabled={loading}
        onClick={() => void handleSubmit()}
      >
        {loading ? 'Входим…' : 'Войти'}
      </button>
    </AuthPageLayout>
  )
}
