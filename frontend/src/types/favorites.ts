export type FavoriteItemType = 'city' | 'hotel' | 'hotel_extra' | 'city_transport'

export type FavoriteItem = {
  id: number
  item_type: FavoriteItemType
  item_key: string
  title: string
  subtitle: string | null
  country: string | null
  description: string
  image_urls: string[]
  created_at: string | null
}

export type FavoriteCreatePayload = {
  item_type: FavoriteItemType
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

export function buildCatalogFavoriteKey(category: string, entityId: string): string {
  return `${category}/${entityId}`
}

export function parseCatalogFavoriteKey(
  itemKey: string
): { category: string; entityId: string } | null {
  const slash = itemKey.indexOf('/')
  if (slash <= 0) return null
  return {
    category: itemKey.slice(0, slash),
    entityId: itemKey.slice(slash + 1),
  }
}
