export type FavoriteItem = {
  id: number
  item_type: 'city' | 'hotel'
  item_key: string
  title: string
  subtitle: string | null
  country: string | null
  description: string
  image_urls: string[]
  created_at: string | null
}

export type FavoriteCreatePayload = {
  item_type: 'city' | 'hotel'
  item_key: string
  title: string
  subtitle?: string | null
  country?: string | null
  description?: string | null
  image_urls?: string[]
}

export function favoriteKey(itemType: string, itemKey: string): string {
  return `${itemType}:${itemKey}`
}
