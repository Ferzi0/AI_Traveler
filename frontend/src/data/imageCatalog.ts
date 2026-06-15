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
