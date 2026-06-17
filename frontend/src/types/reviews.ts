export type CatalogReview = {
  id: number
  entity_type: string
  entity_id: string
  category: string
  rating: number
  body: string
  author: string
  created_at: string | null
  updated_at: string | null
  is_mine: boolean
}

export type CatalogReviewsResponse = {
  average_rating: number | null
  review_count: number
  items: CatalogReview[]
  user_review: CatalogReview | null
}

export type CatalogEntityType = 'accommodation' | 'hotel_extra' | 'city_transport'

export type ReviewableItem = {
  average_rating?: number | null
  review_count?: number
}
