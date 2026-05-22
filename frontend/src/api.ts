export const API_BASE = 'http://localhost:8000/api/v1'

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
      'Нет связи с API (http://localhost:8000). Запустите Docker: docker compose up -d'
    )
  }
  if (!response.ok) {
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
    throw new Error(message)
  }
  return response.json() as Promise<T>
}
