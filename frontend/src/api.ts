import { API_BASE } from './config'

export { API_BASE } from './config'

export const AUTH_EXPIRED_EVENT = 'auth-expired'

export function clearAuthToken() {
  localStorage.removeItem('token')
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

async function extractErrorMessage(response: Response): Promise<string> {
  const details = await response.text()
  let message = details
  try {
    const parsed = JSON.parse(details) as { detail?: string | { msg: string }[] }
    if (typeof parsed.detail === 'string') message = parsed.detail
    else if (Array.isArray(parsed.detail)) {
      message = parsed.detail.map((e) => e.msg).join(', ')
    }
  } catch {
    /* keep raw text */
  }
  return message || `Ошибка сервера (${response.status})`
}

function formatFetchFailure(cause: unknown): string {
  if (cause instanceof TypeError) {
    return (
      `Сервер API недоступен (${API_BASE}). ` +
      'Проверьте, что backend запущен (docker compose up в infra).'
    )
  }
  const detail = cause instanceof Error ? cause.message : String(cause)
  return `Запрос к API не выполнен (${API_BASE}): ${detail}`
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    throw new Error(formatFetchFailure(cause))
  }
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken()
    }
    throw new Error(await extractErrorMessage(response))
  }
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(`Неверный ответ сервера (${response.status})`)
  }
}

export async function apiDownload(path: string): Promise<Blob> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    })
  } catch (cause) {
    throw new Error(formatFetchFailure(cause))
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken()
    }
    throw new Error(await extractErrorMessage(response))
  }

  return response.blob()
}
