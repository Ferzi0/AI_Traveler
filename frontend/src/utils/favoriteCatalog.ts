import type { FavoriteItem, FavoriteItemType } from '../types/favorites'
import { parseCatalogFavoriteKey } from '../types/favorites'
import type { CatalogEntityType } from '../types/reviews'

export function favoriteItemTypeLabel(itemType: FavoriteItemType): string {
  switch (itemType) {
    case 'city':
      return 'Город'
    case 'hotel':
      return 'Отель'
    case 'hotel_extra':
      return 'Место'
    case 'city_transport':
      return 'Транспорт'
    default:
      return 'Место'
  }
}

export function favoriteReviewTarget(item: FavoriteItem): {
  entityType: CatalogEntityType
  entityId: string
  category: string
} | null {
  if (item.item_type === 'hotel') {
    return { entityType: 'accommodation', entityId: item.item_key, category: '' }
  }
  if (item.item_type === 'hotel_extra') {
    const parsed = parseCatalogFavoriteKey(item.item_key)
    if (!parsed) {
      return { entityType: 'hotel_extra', entityId: item.item_key, category: '' }
    }
    return {
      entityType: 'hotel_extra',
      entityId: parsed.entityId,
      category: parsed.category,
    }
  }
  if (item.item_type === 'city_transport') {
    const parsed = parseCatalogFavoriteKey(item.item_key)
    if (!parsed) {
      return { entityType: 'city_transport', entityId: item.item_key, category: '' }
    }
    return {
      entityType: 'city_transport',
      entityId: parsed.entityId,
      category: parsed.category,
    }
  }
  return null
}
