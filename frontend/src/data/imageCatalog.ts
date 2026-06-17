import {
  DEFAULT_DESTINATION_COVER,
  DESTINATION_COVER_BY_TITLE,
  destinationCoverByTitle,
} from './destinationImages'

const ACCOMMODATION_GALLERY_SIZE = 4
const ROOM_GALLERY_SIZE = 4

const CATALOG_ACCOMMODATION_IDS = new Set([
  'acc_phuket_laguna',
  'acc_phuket_hostel',
  'acc_london_hotel',
])

/** Виртуальные отели используют галерею шаблонного каталога по типу размещения. */
function resolveAccommodationId(publicId: string): string {
  if (CATALOG_ACCOMMODATION_IDS.has(publicId)) return publicId
  if (publicId.startsWith('acc_v_')) {
    return publicId.endsWith('_hostel') ? 'acc_phuket_hostel' : 'acc_phuket_laguna'
  }
  return publicId
}

export function accommodationImageUrls(publicId: string): string[] {
  if (!publicId) return []
  const id = resolveAccommodationId(publicId)
  return Array.from(
    { length: ACCOMMODATION_GALLERY_SIZE },
    (_, i) => `/images/hotels/${id}/${i + 1}.jpg`
  )
}

export function accommodationCoverImage(publicId: string): string {
  const urls = accommodationImageUrls(publicId)
  return urls[0] ?? '/images/hotels/default.jpg'
}

export function roomImageUrls(accommodationId: string, roomKey: string): string[] {
  if (!accommodationId || !roomKey) return []
  const id = resolveAccommodationId(accommodationId)
  const base = `/images/rooms/${id}/${roomKey}`
  return Array.from({ length: ROOM_GALLERY_SIZE }, (_, i) => `${base}-${i + 1}.jpg`)
}

export function roomCoverImage(accommodationId: string, roomKey: string): string {
  const urls = roomImageUrls(accommodationId, roomKey)
  return urls[0] ?? '/images/hotels/default.jpg'
}

export function roomCover(room: {
  accommodation_id: string
  room_key: string
  image_urls?: string[]
}): string {
  if (room.image_urls && room.image_urls.length > 0) return room.image_urls[0]
  return roomCoverImage(room.accommodation_id, room.room_key)
}

export function roomGallery(room: {
  accommodation_id: string
  room_key: string
  image_urls?: string[]
}): string[] {
  if (room.image_urls && room.image_urls.length > 0) return room.image_urls
  return roomImageUrls(room.accommodation_id, room.room_key)
}

const DESTINATION_IMAGE_BY_SLUG: Record<string, string> = {
  istanbul: DESTINATION_COVER_BY_TITLE['Стамбул'],
  phuket: DESTINATION_COVER_BY_TITLE['Пхукет'],
  london: DESTINATION_COVER_BY_TITLE['Лондон'],
}

export function destinationImage(itemKey: string, title: string): string | undefined {
  return DESTINATION_IMAGE_BY_SLUG[itemKey] ?? DESTINATION_COVER_BY_TITLE[title]
}

export function destinationCoverImage(item: { id: string; title: string; image_url?: string }): string {
  return (
    destinationImage(item.id, item.title) ??
    (item.image_url && item.image_url.length > 0 ? item.image_url : undefined) ??
    DEFAULT_DESTINATION_COVER
  )
}

export function accommodationGallery(hotel: {
  id: string
  image_urls?: string[]
  image_url?: string | null
}): string[] {
  if (CATALOG_ACCOMMODATION_IDS.has(hotel.id) || hotel.id.startsWith('acc_v_')) {
    return accommodationImageUrls(hotel.id)
  }
  if (hotel.image_urls && hotel.image_urls.length > 0) return hotel.image_urls
  return hotel.image_url ? [hotel.image_url] : ['/images/hotels/default.jpg']
}

export function accommodationCover(hotel: {
  id: string
  image_urls?: string[]
  image_url?: string | null
}): string {
  const gallery = accommodationGallery(hotel)
  return gallery[0] ?? accommodationCoverImage(hotel.id)
}
