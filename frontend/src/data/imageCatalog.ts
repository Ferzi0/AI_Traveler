/** Пути к локальным ассетам — зеркало backend/app/data/hotel_catalog.py и trips.py */

const ACCOMMODATION_GALLERY_SIZE = 4

export function accommodationImageUrls(publicId: string): string[] {
  if (!publicId) return []
  return Array.from(
    { length: ACCOMMODATION_GALLERY_SIZE },
    (_, i) => `/images/hotels/${publicId}/${i + 1}.jpg`
  )
}

export function accommodationCoverImage(publicId: string): string {
  const urls = accommodationImageUrls(publicId)
  return urls[0] ?? '/images/hotels/default.jpg'
}

const DESTINATION_IMAGE_BY_SLUG: Record<string, string> = {
  istanbul: '/images/destinations/istanbul.jpg',
  phuket: '/images/destinations/phuket.jpg',
  london: '/images/destinations/london.jpg',
}

const DESTINATION_IMAGE_BY_TITLE: Record<string, string> = {
  Стамбул: '/images/destinations/istanbul.jpg',
  Пхукет: '/images/destinations/phuket.jpg',
  Лондон: '/images/destinations/london.jpg',
}

export function destinationImage(itemKey: string, title: string): string | undefined {
  return DESTINATION_IMAGE_BY_SLUG[itemKey] ?? DESTINATION_IMAGE_BY_TITLE[title]
}

export function destinationCoverImage(item: { id: string; title: string; image_url?: string }): string {
  return destinationImage(item.id, item.title) ?? item.image_url ?? '/images/destinations/phuket.jpg'
}

export function accommodationGallery(hotel: {
  id: string
  image_urls?: string[]
  image_url?: string | null
}): string[] {
  const catalog = accommodationImageUrls(hotel.id)
  if (catalog.length > 0) return catalog
  if (hotel.image_urls && hotel.image_urls.length > 0) return hotel.image_urls
  return hotel.image_url ? [hotel.image_url] : []
}

export function accommodationCover(hotel: {
  id: string
  image_urls?: string[]
  image_url?: string | null
}): string {
  const gallery = accommodationGallery(hotel)
  return gallery[0] ?? accommodationCoverImage(hotel.id)
}
