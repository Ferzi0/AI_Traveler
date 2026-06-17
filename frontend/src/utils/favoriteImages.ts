import { accommodationImageUrls, destinationImage } from '../data/imageCatalog'
import type { FavoriteItem } from '../types/favorites'


export function favoriteGallery(item: FavoriteItem): string[] {
  if (item.item_type === 'hotel') {
    const catalog = accommodationImageUrls(item.item_key)
    if (catalog.length > 0) return catalog
  }
  if (item.item_type === 'city') {
    const cover = destinationImage(item.item_key, item.title)
    if (cover) return [cover]
  }
  if (item.image_urls.length > 0) return item.image_urls
  return []
}
