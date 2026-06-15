/** Тематические обложки для доп. дерева — категории и варианты пунктов каталога. */

const DETAIL_CATEGORY_IMAGE: Record<string, string> = {
  restaurants: '/images/detail/categories/restaurants.jpg',
  attractions: '/images/detail/categories/attractions.jpg',
  events: '/images/detail/categories/events.jpg',
  walking_routes: '/images/detail/categories/walking_routes.jpg',
  public_transport: '/images/detail/categories/public_transport.jpg',
  taxi: '/images/detail/categories/taxi.jpg',
  rent: '/images/detail/categories/rent.jpg',
  ferry: '/images/detail/categories/ferry.jpg',
}

const DETAIL_VARIANT_COUNT: Record<string, number> = {
  restaurants: 4,
  attractions: 4,
  events: 3,
  walking_routes: 3,
  public_transport: 3,
  taxi: 3,
  rent: 3,
  ferry: 3,
}

const DETAIL_ITEM_IMAGE: Record<string, string> = {
  laguna_rest_1: '/images/detail/items/laguna_rest_1.jpg',
  laguna_rest_2: '/images/detail/items/laguna_rest_2.jpg',
  laguna_rest_3: '/images/detail/items/laguna_rest_3.jpg',
  laguna_attr_1: '/images/detail/items/laguna_attr_1.jpg',
  laguna_attr_2: '/images/detail/items/laguna_attr_2.jpg',
  laguna_event_1: '/images/detail/items/laguna_event_1.jpg',
  laguna_event_2: '/images/detail/items/laguna_event_2.jpg',
  laguna_walk_1: '/images/detail/items/laguna_walk_1.jpg',
  laguna_walk_2: '/images/detail/items/laguna_walk_2.jpg',
  hostel_rest_1: '/images/detail/items/hostel_rest_1.jpg',
  hostel_rest_2: '/images/detail/items/hostel_rest_2.jpg',
  hostel_attr_1: '/images/detail/items/hostel_attr_1.jpg',
  hostel_event_1: '/images/detail/items/hostel_event_1.jpg',
  hostel_walk_1: '/images/detail/items/hostel_walk_1.jpg',
  london_rest_1: '/images/detail/items/london_rest_1.jpg',
  london_attr_1: '/images/detail/items/london_attr_1.jpg',
  london_event_1: '/images/detail/items/london_event_1.jpg',
  london_walk_1: '/images/detail/items/london_walk_1.jpg',
  phuket_bus_1: '/images/detail/items/phuket_bus_1.jpg',
  phuket_taxi_1: '/images/detail/items/phuket_taxi_1.jpg',
  phuket_rent_1: '/images/detail/items/phuket_rent_1.jpg',
  phuket_ferry_1: '/images/detail/items/phuket_ferry_1.jpg',
  london_public_1: '/images/detail/items/london_public_1.jpg',
  london_taxi_1: '/images/detail/items/london_taxi_1.jpg',
  london_rent_1: '/images/detail/items/london_rent_1.jpg',
  istanbul_public_1: '/images/detail/items/istanbul_public_1.jpg',
  istanbul_taxi_1: '/images/detail/items/istanbul_taxi_1.jpg',
  istanbul_ferry_1: '/images/detail/items/istanbul_ferry_1.jpg',
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function detailCategoryImage(category: string): string {
  return DETAIL_CATEGORY_IMAGE[category] ?? '/images/hotels/default.jpg'
}

function detailItemVariantImage(category: string, itemId: string): string {
  const count = DETAIL_VARIANT_COUNT[category] ?? 3
  const index = (hashString(itemId) % count) + 1
  return `/images/detail/variants/${category}-${index}.jpg`
}

function detailItemImage(itemId: string, category: string): string {
  return DETAIL_ITEM_IMAGE[itemId] ?? detailItemVariantImage(category, itemId)
}

export function detailHotelCategoryCover(
  category: string,
  _hotelId: string,
  _destination: { id: string; title: string; image_url?: string }
): string {
  return detailCategoryImage(category)
}

export function detailCityCategoryCover(
  category: string,
  _destination: { id: string; title: string; image_url?: string }
): string {
  return detailCategoryImage(category)
}

export function detailHotelItemCover(
  itemId: string,
  category: string,
  _hotelId: string,
  _destination: { id: string; title: string; image_url?: string }
): string {
  return detailItemImage(itemId, category)
}

export function detailCityItemCover(
  itemId: string,
  category: string,
  _destination: { id: string; title: string; image_url?: string }
): string {
  return detailItemImage(itemId, category)
}
