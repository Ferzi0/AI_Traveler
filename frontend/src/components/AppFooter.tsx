import { useEffect, useState } from 'react'
import { api } from '../api'
import type { PlatformStats } from '../types/stats'

function formatCount(value: number): string {
  return value.toLocaleString('ru-RU')
}

export function AppFooter() {
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    let cancelled = false
    void api<PlatformStats>('/stats')
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        if (!cancelled) setStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const usersLabel = stats ? formatCount(stats.users_count) : '—'
  const tripsLabel = stats ? formatCount(stats.trips_count) : '—'

  return (
    <footer className="footer">
      <span>AI TRAVELER</span>
      <span>
        Users {usersLabel}
        &nbsp; Trips {tripsLabel}
      </span>
    </footer>
  )
}
