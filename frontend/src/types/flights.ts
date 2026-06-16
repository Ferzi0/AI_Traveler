export type PopularDestination = {
  origin: string
  destination: string
  origin_airport?: string | null
  destination_airport?: string | null
  origin_name?: string | null
  destination_name?: string | null
  /** Из справочника IATA или destination_name API */
  city: string
  country: string
  origin_label?: string | null
  price: number
  airline?: string | null
  flight_number?: number | string | null
  departure_at?: string | null
  return_at?: string | null
  transfers?: number | null
  return_transfers?: number | null
  duration?: number | null
  duration_to?: number | null
  duration_back?: number | null
  link?: string | null
  aviasales_url?: string | null
  expires_at?: string | null
}

export type PopularDirectionsResponse = {
  origin: string
  origin_label: string
  currency: string
  items: PopularDestination[]
}

export type PriceCalendarDay = {
  date: string
  origin: string
  destination: string
  price: number
  transfers?: number | null
  airline?: string | null
  flight_number?: number | string | null
  departure_at?: string | null
  return_at?: string | null
  expires_at?: string | null
  city?: string
  country?: string
}

export type PriceCalendarResponse = {
  origin: string
  destination: string
  origin_label: string
  destination_label: string
  depart_month: string
  return_month?: string | null
  trip_length?: number | null
  currency: string
  items: PriceCalendarDay[]
}

export type SpecialOffer = {
  origin: string
  destination: string
  origin_airport?: string | null
  destination_airport?: string | null
  origin_name?: string | null
  destination_name?: string | null
  city: string
  country: string
  price: number
  airline?: string | null
  airline_title?: string | null
  flight_number?: number | string | null
  departure_at?: string | null
  return_at?: string | null
  duration?: number | null
  title?: string | null
  mini_title?: string | null
  link?: string | null
  aviasales_url?: string | null
  color?: string | null
}

export type SpecialOffersResponse = {
  origin: string
  destination?: string | null
  origin_label: string
  currency: string
  items: SpecialOffer[]
}
