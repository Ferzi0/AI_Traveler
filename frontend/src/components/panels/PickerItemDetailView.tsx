import { useState } from 'react'
import { PhotoSlider } from '../PhotoSlider'
import type { CatalogEntityType } from '../types/reviews'
import { ReviewsSection } from '../ReviewsSection'
import { StarRating } from '../StarRating'

type Props = {
  title: string
  description: string
  images: string[]
  priceLabel: string
  priceMeta?: string
  entityType: CatalogEntityType
  entityId: string
  category?: string
  averageRating?: number | null
  reviewCount?: number
  selected?: boolean
  onBack: () => void
  onSelect: () => void
}

export function PickerItemDetailView({
  title,
  description,
  images,
  priceLabel,
  priceMeta,
  entityType,
  entityId,
  category = '',
  averageRating,
  reviewCount,
  selected = false,
  onBack,
  onSelect,
}: Props) {
  const [summary, setSummary] = useState({
    average_rating: averageRating ?? null,
    review_count: reviewCount ?? 0,
  })

  return (
    <div className="pickerDetail">
      <button type="button" className="pickerDetail__back" onClick={onBack}>
        ← К списку
      </button>

      <div className="pickerDetail__hero">
        <PhotoSlider images={images} variant="card" autoMs={4500} />
      </div>

      <div className="pickerDetail__body">
        <div className="pickerDetail__head">
          <h3 className="pickerDetail__title">{title}</h3>
          {summary.average_rating != null ? (
            <StarRating
              value={summary.average_rating}
              size="md"
              showValue
              reviewCount={summary.review_count}
            />
          ) : null}
        </div>

        <p className="pickerDetail__description">{description}</p>

        <div className="pickerDetail__priceRow">
          <div>
            <span className="pickerDetail__price">{priceLabel}</span>
            {priceMeta ? <span className="pickerDetail__priceMeta">{priceMeta}</span> : null}
          </div>
          <button
            type="button"
            className={`btn pickerDetail__selectBtn${selected ? ' btn--secondary' : ' btnAccent'}`}
            onClick={onSelect}
          >
            {selected ? 'Выбрано' : 'Выбрать'}
          </button>
        </div>

        <ReviewsSection
          entityType={entityType}
          entityId={entityId}
          category={category}
          active
          onSummaryChange={setSummary}
        />
      </div>
    </div>
  )
}
