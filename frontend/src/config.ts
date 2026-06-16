// import.meta.env доступен только в клиентском бандле Vite, не в vite.config.ts
const isDev = import.meta.env?.DEV === true

export const appConfig = {
  apiBase: isDev ? 'http://localhost:8000/api/v1' : 'https://ai-traveler-0jhd.onrender.com/api/v1',
  frontendUrl: isDev ? 'http://localhost:5173' : 'https://ai-traveler-1.onrender.com',
  frontendHost: isDev ? 'localhost' : 'ai-traveler-1.onrender.com',
  backendHost: isDev ? 'localhost' : 'ai-traveler-0jhd.onrender.com',
} as const

export const API_BASE = appConfig.apiBase
