import {
  accommodationCoverImage,
  accommodationImageUrls,
  destinationCoverImage,
} from './imageCatalog'

const HOTEL_EXTRA_CATEGORY_INDEX: Record<string, number> = {
  restaurants: 0,
  attractions: 1,
  events: 2,
  walking_routes: 3,
}

const CITY_TRANSPORT_CATEGORY_INDEX: Record<string, number> = {
  public_transport: 0,
  taxi: 1,
  rent: 2,
  ferry: 3,
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function pickFromPool(pool: string[], seed: string): string {
  if (pool.length === 0) return '/images/hotels/default.jpg'
  return pool[hashString(seed) % pool.length]
}

export function detailHotelCategoryCover(
  category: string,
  hotelId: string,
  destination: { id: string; title: string; image_url?: string }
): string {
  const gallery = accommodationImageUrls(hotelId)
  const index = HOTEL_EXTRA_CATEGORY_INDEX[category] ?? 0
  if (gallery[index]) return gallery[index]
  return accommodationCoverImage(hotelId)
}

export function detailCityCategoryCover(
  category: string,
  destination: { id: string; title: string; image_url?: string }
): string {
  const destCover = destinationCoverImage(destination)
  const gallery = [
    destCover,
    '/images/destinations/phuket.jpg',
    '/images/destinations/london.jpg',
    '/images/destinations/istanbul.jpg',
  ].filter((url, idx, arr) => arr.indexOf(url) === idx)
  const index = CITY_TRANSPORT_CATEGORY_INDEX[category] ?? 0
  return gallery[index] ?? destCover
}

export function detailHotelItemCover(
  itemId: string,
  category: string,
  hotelId: string,
  destination: { id: string; title: string; image_url?: string }
): string {
  const pool = accommodationImageUrls(hotelId)
  if (pool.length > 0) return pickFromPool(pool, `${category}:${itemId}`)
  return detailHotelCategoryCover(category, hotelId, destination)
}

export function detailCityItemCover(
  itemId: string,
  category: string,
  destination: { id: string; title: string; image_url?: string }
): string {
  const destCover = destinationCoverImage(destination)
  const pool = [destCover, '/images/destinations/barcelona.jpg', '/images/destinations/paris.jpg']
  return pickFromPool(pool, `${category}:${itemId}`)
}
