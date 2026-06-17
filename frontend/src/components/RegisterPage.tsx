import { useState } from 'react'
import { API_BASE } from '../config'
import { formatPhone } from '../utils/phone'
import { AuthPageLayout } from './AuthPageLayout'
import '../App.css'

type Props = {
  onSuccess: () => void
  onGoLogin: () => void
  onGoHome: () => void
}

type FormState = {
  email: string
  phone: string
  last_name: string
  first_name: string
  middle_name: string
  login: string
  password: string
  password2: string
}

const SECTIONS: {
  label: string
  fields: { key: keyof FormState; placeholder: string; type?: string; autoComplete?: string }[]
}[] = [
  {
    label: 'Контакты',
    fields: [
      { key: 'email', placeholder: 'name@example.com', type: 'email', autoComplete: 'email' },
      { key: 'phone', placeholder: 'Номер телефона +7(999)999-99-99', autoComplete: 'tel' },
    ],
  },
  {
    label: 'Личные данные',
    fields: [
      { key: 'last_name', placeholder: 'Фамилия', autoComplete: 'family-name' },
      { key: 'first_name', placeholder: 'Имя', autoComplete: 'given-name' },
      { key: 'middle_name', placeholder: 'Отчество', autoComplete: 'additional-name' },
    ],
  },
  {
    label: 'Аккаунт',
    fields: [
      { key: 'login', placeholder: 'Логин', autoComplete: 'username' },
      { key: 'password', placeholder: 'Пароль', type: 'password', autoComplete: 'new-password' },
      { key: 'password2', placeholder: 'Повторите пароль', type: 'password', autoComplete: 'new-password' },
    ],
  },
]

export function RegisterPage({ onSuccess, onGoLogin, onGoHome }: Props) {
  const [form, setForm] = useState<FormState>({
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

  function set(field: keyof FormState) {
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

  return (
    <AuthPageLayout
      title="Создать аккаунт"
      subtitle="Заполните данные — и можно собирать первую поездку"
      onGoHome={onGoHome}
      footer={
        <button type="button" className="authLink" onClick={onGoLogin}>
          Уже есть аккаунт? Войти
        </button>
      }
    >
      {error ? <div className="authError">{error}</div> : null}

      {SECTIONS.map((section) => (
        <div key={section.label} className="authSection">
          <p className="authSection__label">{section.label}</p>
          {section.fields.map(({ key, placeholder, type, autoComplete }) => (
            <div key={key} className="authField">
              <input
                type={type ?? 'text'}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                autoComplete={autoComplete}
              />
            </div>
          ))}
        </div>
      ))}

      <button
        type="button"
        className="authBtn"
        disabled={loading}
        onClick={() => void handleSubmit()}
      >
        {loading ? 'Регистрация…' : 'Зарегистрироваться'}
      </button>
    </AuthPageLayout>
  )
}
