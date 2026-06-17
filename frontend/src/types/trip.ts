export type TransportLegDetail = {
  id: string
  title: string
  airline: string
  aircraft_model: string
  cabin_class: string
  duration_min: number
  price: number
  source_url: string
  price_includes: string[]
  direction: string
  direction_label: string
  departure_at?: string | null
  transfers?: number | null
  origin_airport?: string | null
  destination_airport?: string | null
}

export type TransportItineraryDetails = {
  total_duration_min: number
  price_per_passenger: number
  passengers: number
  legs: TransportLegDetail[]
  price_includes: string[]
  sources: Array<{ airline: string; url: string }>
  cabin_class: string
  data_source_note: string
  aviasales_url?: string | null
  expires_at?: string | null
  origin_iata?: string
  destination_iata?: string
  origin_label?: string
  destination_label?: string
}

export type TransportItinerary = {
  itinerary_id: string
  outbound: { title: string }
  inbound: { title: string } | null
  total_duration_min: number
  total_price: number
  details: TransportItineraryDetails
}

export type DestinationItem = {
  id: string
  title: string
  country: string
  image_url?: string
}

export type AccommodationItem = {
  id: string
  title: string
  kind: string
  rating: number
  price: number
  distance_km?: number
  stars: number
  breakfast_included: boolean
  has_pool: boolean
  latitude: number
  longitude: number
  image_url: string | null
  image_urls: string[]
  destination?: string
  average_rating?: number | null
  review_count?: number
}

export type AccommodationSearchResponse = {
  items: AccommodationItem[]
  nights: number
  passengers: number
  map_center: { latitude: number; longitude: number }
}

export type RoomItem = {
  room_id: string
  accommodation_id: string
  room_key: string
  room_name: string
  price_total: number
  price_per_night: number
  nights: number
  persons: number
  max_persons: number
  image_urls: string[]
  area_sqm: number
  bed_type: string
  view: string
  amenities: string[]
  description: string
}

export type HotelExtraItem = {
  id: string
  title: string
  description: string
  estimated_cost: number
  average_rating?: number | null
  review_count?: number
}

export type HotelExtrasCategory = {
  category: string
  title: string
  items: HotelExtraItem[]
}

export type HotelExtrasResponse = {
  categories: HotelExtrasCategory[]
}

export type TransportExtraItem = {
  id: string
  title: string
  description: string
  estimated_cost: number
}

export type TransportExtrasCategory = {
  category: string
  title: string
  items: TransportExtraItem[]
}

export type TransportExtrasResponse = {
  categories: TransportExtrasCategory[]
}

export type CityTransportItem = {
  id: string
  title: string
  description: string
  estimated_cost: number
  average_rating?: number | null
  review_count?: number
}

export type CityTransportCategory = {
  category: string
  title: string
  items: CityTransportItem[]
}

export type CityTransportResponse = {
  categories: CityTransportCategory[]
}

export type DayPlanItem = {
  id: string
  title: string
  description: string
  estimated_cost: number
}

export type DayPlanSlot = {
  slot: string
  title: string
  items: DayPlanItem[]
}

export type DayPlanDay = {
  day_key: string
  date: string
  title: string
  theme: string
  slots: DayPlanSlot[]
}

export type DayPlanResponse = {
  days: DayPlanDay[]
}

export type TripSummary = {
  total_estimated_cost: number
  currency?: string
  calculation: {
    items: Array<{
      node_type: string
      title: string
      formula: string
      values: Record<string, number>
      result: number
      is_per_person?: boolean
      per_person?: number | null
      passengers?: number | null
    }>
    total_formula: string
  }
  params?: {
    passengers: number
  }
}
