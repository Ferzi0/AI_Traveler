const DEFAULT_API = 'http://localhost:8000/api/v1'
const DEFAULT_FRONTEND = 'http://localhost:5173'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function envOrDefault(name: string, fallback: string): string {
  const value = import.meta.env[name]?.trim()
  return trimTrailingSlash(value || fallback)
}

function hostFromUrl(url: string, fallback: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return fallback
  }
}

const apiBase = envOrDefault('VITE_API_BASE', DEFAULT_API)
const frontendUrl = envOrDefault('VITE_FRONTEND_URL', DEFAULT_FRONTEND)

export const appConfig = {
  apiBase,
  frontendUrl,
  frontendHost: hostFromUrl(frontendUrl, 'localhost'),
  backendHost: hostFromUrl(apiBase, 'localhost'),
} as const

export const API_BASE = appConfig.apiBase
