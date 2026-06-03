export const API_BASE = 'https://ai-traveler-0jhd.onrender.com/api/v1'

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
  return message
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
  } catch {
    throw new Error(
      'Нет связи с API (https://ai-traveler-0jhd.onrender.com/api/v1). Перезапустите хост.'
    )
  }
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }
  return response.json() as Promise<T>
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
  } catch {
    throw new Error(
      'Нет связи с API (https://ai-traveler-0jhd.onrender.com). Перезапустите хост.'
    )
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return response.blob()
}
