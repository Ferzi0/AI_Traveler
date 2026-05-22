import { useCallback, useEffect, useState } from 'react'

const PLACEHOLDER_SLIDES = 3

type Props = {
  images: string[]
  autoMs?: number
}

export function PhotoSlider({ images, autoMs = 3000 }: Props) {
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
    if (slides.length <= 1) return
    const timer = window.setInterval(() => go(1), autoMs)
    return () => window.clearInterval(timer)
  }, [go, autoMs, slides.length])

  return (
    <div className="photoSlider">
      <button
        type="button"
        className="photoSlider__arrow photoSlider__arrow--prev"
        aria-label="Предыдущее фото"
        onClick={() => go(-1)}
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
              style={
                images.length > 0 && src.startsWith('http')
                  ? { backgroundImage: `url(${src})` }
                  : undefined
              }
            >
              {images.length === 0 ? <span>Фото {i + 1}</span> : null}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="photoSlider__arrow photoSlider__arrow--next"
        aria-label="Следующее фото"
        onClick={() => go(1)}
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
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
