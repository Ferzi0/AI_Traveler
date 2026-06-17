import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { CatalogEntityType, CatalogReviewsResponse } from '../types/reviews'
import { StarRating, StarRatingInput } from './StarRating'

type Props = {
  entityType: CatalogEntityType
  entityId: string
  category?: string
  active: boolean
  onSummaryChange?: (summary: { average_rating: number | null; review_count: number }) => void
}

export function ReviewsSection({
  entityType,
  entityId,
  category = '',
  active,
  onSummaryChange,
}: Props) {
  const [data, setData] = useState<CatalogReviewsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : ''
      const res = await api<CatalogReviewsResponse>(
        `/reviews/${entityType}/${encodeURIComponent(entityId)}${params}`
      )
      setData(res)
      onSummaryChange?.({
        average_rating: res.average_rating,
        review_count: res.review_count,
      })
      if (res.user_review) {
        setRating(res.user_review.rating)
        setBody(res.user_review.body)
      } else {
        setRating(5)
        setBody('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отзывы')
    } finally {
      setLoading(false)
    }
  }, [category, entityId, entityType, onSummaryChange])

  useEffect(() => {
    if (!active) return
    void load()
  }, [active, load])

  async function submitReview() {
    if (!body.trim()) {
      setError('Напишите пару слов об этом месте')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api('/reviews', 'POST', {
        entity_type: entityType,
        entity_id: entityId,
        category,
        rating,
        body: body.trim(),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить отзыв')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="reviewsSection" aria-labelledby="reviews-section-title">
      <header className="reviewsSection__header">
        <h3 id="reviews-section-title" className="reviewsSection__title">
          Отзывы
        </h3>
        {data?.average_rating != null ? (
          <StarRating
            value={data.average_rating}
            size="md"
            showValue
            reviewCount={data.review_count}
          />
        ) : null}
      </header>

      {loading ? <p className="reviewsSection__hint">Загрузка отзывов…</p> : null}
      {error ? <p className="reviewsSection__error">{error}</p> : null}

      {!loading && data && data.items.length === 0 ? (
        <p className="reviewsSection__hint">Пока нет отзывов — будьте первым.</p>
      ) : null}

      {data?.items.length ? (
        <ul className="reviewsSection__list">
          {data.items.map((review) => (
            <li key={review.id} className="reviewsSection__item">
              <div className="reviewsSection__itemHead">
                <strong>{review.author}</strong>
                <StarRating value={review.rating} size="sm" />
              </div>
              <p className="reviewsSection__text">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="reviewsSection__form">
        <p className="reviewsSection__formTitle">Ваш отзыв</p>
        <StarRatingInput value={rating} onChange={setRating} disabled={saving} />
        <textarea
          className="reviewsSection__textarea"
          rows={3}
          placeholder="Что понравилось, что стоит знать…"
          value={body}
          disabled={saving}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="button"
          className="btn btnAccent reviewsSection__submit"
          disabled={saving}
          onClick={() => void submitReview()}
        >
          {saving ? 'Сохраняем…' : data?.user_review ? 'Обновить отзыв' : 'Оставить отзыв'}
        </button>
      </div>
    </section>
  )
}
