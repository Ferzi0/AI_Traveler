const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

const DEFAULT_LOCAL_API = 'http://localhost:8000/api/v1'
const DEFAULT_PROD_API = 'https://ai-traveler-0jhd.onrender.com/api/v1'
const DEFAULT_LOCAL_FRONTEND = 'http://localhost:5173'
const DEFAULT_PROD_FRONTEND = 'https://ai-traveler-1.onrender.com'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return import.meta.env.DEV
  }
  return LOCAL_HOSTS.has(window.location.hostname)
}

function envOrDefault(name: string, fallback: string): string {
  const value = import.meta.env[name]?.trim()
  return trimTrailingSlash(value || fallback)
}

function resolveApiBase(): string {
  return envOrDefault('VITE_API_BASE', isLocalHost() ? DEFAULT_LOCAL_API : DEFAULT_PROD_API)
}

function resolveFrontendUrl(): string {
  return envOrDefault('VITE_FRONTEND_URL', isLocalHost() ? DEFAULT_LOCAL_FRONTEND : DEFAULT_PROD_FRONTEND)
}

function hostFromUrl(url: string, fallback: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return fallback
  }
}

const apiBase = resolveApiBase()
const frontendUrl = resolveFrontendUrl()

export const appConfig = {
  apiBase,
  frontendUrl,
  frontendHost: hostFromUrl(frontendUrl, isLocalHost() ? 'localhost' : 'ai-traveler-1.onrender.com'),
  backendHost: hostFromUrl(apiBase, isLocalHost() ? 'localhost' : 'ai-traveler-0jhd.onrender.com'),
} as const

export const API_BASE = appConfig.apiBase
