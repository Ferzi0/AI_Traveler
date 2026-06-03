import { useState } from 'react'
import { formatPhone } from '../utils/phone'
import { AppFooter } from './AppFooter'
import { BrandLogo } from './BrandLogo'
import '../App.css'

type Props = {
  onSuccess: () => void
  onGoLogin: () => void
}

const API_BASE = 'https://ai-traveler-0jhd.onrender.com/api/v1'

export function RegisterPage({ onSuccess, onGoLogin }: Props) {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    login: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'phone' ? formatPhone(e.target.value) : e.target.value
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit() {
    const { password, password2, ...rest } = form
    if (Object.values(rest).some(v => !v) || !password) {
      setError('Заполните все поля')
      return
    }
    if (password !== password2) { setError('Пароли не совпадают'); return }
    if (form.phone.length < 16) { setError('Введите телефон полностью'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          last_name: form.last_name,
          first_name: form.first_name,
          middle_name: form.middle_name,
          login: form.login,
          password,
        }),
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
                : 'Ошибка регистрации'
        )
        return
      }
      onSuccess()
    } catch {
      setError('Нет связи с сервером')
    } finally {
      setLoading(false)
    }
  }

  const fields: { key: keyof typeof form; placeholder: string; type?: string }[] = [
    { key: 'email', placeholder: 'Почта', type: 'email' },
    { key: 'phone', placeholder: 'Номер телефона +7(999)999-99-99' },
    { key: 'last_name', placeholder: 'Фамилия' },
    { key: 'first_name', placeholder: 'Имя' },
    { key: 'middle_name', placeholder: 'Отчество' },
    { key: 'login', placeholder: 'Логин' },
    { key: 'password', placeholder: 'Пароль', type: 'password' },
    { key: 'password2', placeholder: 'Повторите пароль', type: 'password' },
  ]

  return (
    <div className="authPage">
      <header className="topBar">
        <div className="topBarInner">
          <span className="logo">
            <BrandLogo />
          </span>
        </div>
      </header>

      <div className="authBody">
        <div className="authCard">
          <h1 className="authTitle">Регистрация</h1>

          {error && <div className="authError">{error}</div>}

          {fields.map(({ key, placeholder, type }) => (
            <div key={key} className="authField">
              <input
                type={type ?? 'text'}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
              />
            </div>
          ))}

          <button
            type="button"
            className="authBtn"
            disabled={loading}
            onClick={() => void handleSubmit()}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <button type="button" className="authLink" onClick={onGoLogin}>
            Уже есть аккаунт? Войдите!
          </button>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
