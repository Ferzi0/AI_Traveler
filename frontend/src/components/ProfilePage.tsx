import { useEffect, useState } from 'react'
import { api } from '../api'
import type { UserProfile } from '../types/user'
import { formatPhone } from '../utils/phone'
import { AppFooter } from './AppFooter'
import '../App.css'

type Props = {
  onClose: () => void
  onLogout: () => void
  onUpdated?: (user: UserProfile) => void
}

type ProfileForm = {
  last_name: string
  first_name: string
  middle_name: string
  email: string
  phone: string
  login: string
  default_origin: string
}

function profileToForm(user: UserProfile): ProfileForm {
  return {
    last_name: user.last_name,
    first_name: user.first_name,
    middle_name: user.middle_name,
    email: user.email,
    phone: user.phone,
    login: user.login,
    default_origin: user.default_origin,
  }
}

export function ProfilePage({ onClose, onLogout, onUpdated }: Props) {
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void api<UserProfile>('/auth/me')
      .then((user) => {
        if (!cancelled) setForm(profileToForm(user))
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить профиль')
          setForm(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function setField(field: keyof ProfileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'phone' ? formatPhone(e.target.value) : e.target.value
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
    }
  }

  async function handleSave() {
    if (!form) return
    if (form.phone.length < 16) {
      setError('Введите телефон полностью')
      return
    }

    setSaving(true)
    setError('')
    try {
      const updated = await api<UserProfile>('/auth/me', 'PATCH', {
        last_name: form.last_name,
        first_name: form.first_name,
        middle_name: form.middle_name,
        email: form.email,
        phone: form.phone,
        default_origin: form.default_origin,
      })
      setForm(profileToForm(updated))
      onUpdated?.(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить профиль')
    } finally {
      setSaving(false)
    }
  }

  const displayName = form
    ? `${form.last_name} ${form.first_name} ${form.middle_name}`.trim()
    : ''

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

          {error ? <div className="authError">{error}</div> : null}

          {loading ? (
            <p className="emptyTree">Загрузка профиля…</p>
          ) : form ? (
            <>
              <div className="profileCard">
                <div className="profileAvatar">{(displayName || form.login).charAt(0)}</div>
                <div className="profileMeta">
                  <span className="profileName">{displayName || form.login}</span>
                  <span className="profileSub">@{form.login}</span>
                </div>
              </div>

              <div className="profileForm">
                <div className="profileField">
                  <label htmlFor="profileLastName">Фамилия</label>
                  <input
                    id="profileLastName"
                    type="text"
                    value={form.last_name}
                    onChange={setField('last_name')}
                  />
                </div>
                <div className="profileField">
                  <label htmlFor="profileFirstName">Имя</label>
                  <input
                    id="profileFirstName"
                    type="text"
                    value={form.first_name}
                    onChange={setField('first_name')}
                  />
                </div>
                <div className="profileField">
                  <label htmlFor="profileMiddleName">Отчество</label>
                  <input
                    id="profileMiddleName"
                    type="text"
                    value={form.middle_name}
                    onChange={setField('middle_name')}
                  />
                </div>
                <div className="profileField">
                  <label htmlFor="profileEmail">Email</label>
                  <input
                    id="profileEmail"
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                  />
                </div>
                <div className="profileField">
                  <label htmlFor="profilePhone">Телефон</label>
                  <input
                    id="profilePhone"
                    type="tel"
                    placeholder="+7(999)999-99-99"
                    value={form.phone}
                    onChange={setField('phone')}
                  />
                </div>
                <div className="profileField">
                  <label htmlFor="profileLogin">Логин</label>
                  <input id="profileLogin" type="text" value={form.login} readOnly />
                </div>
                <div className="profileField">
                  <label htmlFor="profileCity">Город вылета по умолчанию</label>
                  <input
                    id="profileCity"
                    type="text"
                    value={form.default_origin}
                    onChange={setField('default_origin')}
                  />
                </div>

                <div className="profileActions">
                  <button
                    type="button"
                    className="btn btnAccent"
                    disabled={saving}
                    onClick={() => void handleSave()}
                  >
                    {saved ? 'Сохранено ✓' : saving ? 'Сохранение…' : 'Сохранить'}
                  </button>
                  <button type="button" className="btn btnDanger" onClick={onLogout}>
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="emptyTree">Профиль недоступен</p>
          )}
        </div>

        <AppFooter />
      </div>
    </div>
  )
}
