import type { CSSProperties } from 'react'

/** Paths from frontend/public or absolute URLs returned by the API. */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed
  }
  return `/images/${trimmed}`
}

export function imageBackgroundStyle(url: string | null | undefined): CSSProperties | undefined {
  const resolved = resolveImageUrl(url)
  return resolved ? { backgroundImage: `url(${resolved})` } : undefined
}
