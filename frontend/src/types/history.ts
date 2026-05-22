export type HistoryListItem = {
  id: number
  trip_id: number | null
  trip_name: string
  destination: string | null
  origin: string | null
  hotel: string | null
  room: string | null
  flight: string | null
  baggage: string | null
  refund: string | null
  date: string
  passengers: number | null
  total: number | null
  total_label: string
  saved_at: string | null
}

export type HistoryDetail = HistoryListItem & {
  snapshot: Record<string, unknown> | null
}
