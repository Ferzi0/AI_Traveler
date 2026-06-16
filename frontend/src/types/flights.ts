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
  expires_at?: string | null
}

export type PopularDirectionsResponse = {
  origin: string
  origin_label: string
  currency: string
  items: PopularDestination[]
}
