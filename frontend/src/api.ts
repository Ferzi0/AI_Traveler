import { API_BASE, appConfig } from './config'

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
  } catch {}
  return message || `Ошибка сервера (${response.status})`
}

function formatFetchFailure(cause: unknown): string {
  if (cause instanceof TypeError) {
    const hint = appConfig.backendHost.includes('onrender.com')
      ? 'Сервер мог уйти в сон — подождите минуту и обновите страницу.'
      : 'Проверьте, что backend запущен (docker compose up в infra).'
    return `Сервер API недоступен (${API_BASE}). ${hint}`
  }
  const detail = cause instanceof Error ? cause.message : String(cause)
  return `Запрос к API не выполнен (${API_BASE}): ${detail}`
}

const RETRYABLE_STATUSES = new Set([502, 503, 504])
const RETRY_DELAYS_MS = [1500, 3000]

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const attempts = RETRY_DELAYS_MS.length + 1
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, init)
      if (RETRYABLE_STATUSES.has(response.status) && attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        continue
      }
      return response
    } catch (cause) {
      lastError = cause
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        continue
      }
    }
  }

  throw lastError
}

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetchWithRetry(`${API_BASE}${path}`, {
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
    response = await fetchWithRetry(`${API_BASE}${path}`, {
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
