import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { imageBackgroundStyle } from '../utils/images'

const PLACEHOLDER_SLIDES = 3

type Props = {
  images: string[]
  autoMs?: number
  variant?: 'default' | 'card' | 'catalog'
  className?: string
}

function stopBubble(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
}

export function PhotoSlider({
  images,
  autoMs = 4000,
  variant = 'default',
  className = '',
}: Props) {
  const slides =
    images.length > 0
      ? images
      : Array.from({ length: PLACEHOLDER_SLIDES }, (_, i) => `placeholder-${i}`)

  const [index, setIndex] = useState(0)

  const go = useCallback(
    (delta: number) => {
      setIndex((prev) => (prev + delta + slides.length) % slides.length)
    },
    [slides.length]
  )

  useEffect(() => {
    setIndex(0)
  }, [images])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = window.setInterval(() => go(1), autoMs)
    return () => window.clearInterval(timer)
  }, [go, autoMs, slides.length])

  const rootClass = [
    'photoSlider',
    variant === 'card' ? 'photoSlider--card' : '',
    variant === 'catalog' ? 'photoSlider--catalog' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <button
        type="button"
        className="photoSlider__arrow photoSlider__arrow--prev"
        aria-label="Предыдущее фото"
        onClick={(e) => {
          stopBubble(e)
          go(-1)
        }}
      >
        ‹
      </button>
      <div className="photoSlider__viewport">
        <div
          className="photoSlider__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="photoSlider__slide"
              style={images.length > 0 ? imageBackgroundStyle(src) : undefined}
            >
              {images.length === 0 ? <span>Фото {i + 1}</span> : null}
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <span className="photoSlider__counter" aria-hidden>
            {index + 1}/{images.length}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        className="photoSlider__arrow photoSlider__arrow--next"
        aria-label="Следующее фото"
        onClick={(e) => {
          stopBubble(e)
          go(1)
        }}
      >
        ›
      </button>
      <div className="photoSlider__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`photoSlider__dot${i === index ? ' photoSlider__dot--active' : ''}`}
            aria-label={`Слайд ${i + 1}`}
            onClick={(e) => {
              stopBubble(e)
              setIndex(i)
            }}
          />
        ))}
      </div>
    </div>
  )
}
