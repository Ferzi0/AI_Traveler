type Feature = {
  icon: string
  title: string
  description: string
  targetId: string
}

const FEATURES: Feature[] = [
  {
    icon: '🏷',
    title: 'Лучшие цены',
    description: 'Сравнение тарифов Aviasales в одном месте',
    targetId: 'home-flight-offers-title',
  },
  {
    icon: '📅',
    title: 'Гибкие даты',
    description: 'Календарь цен — выберите удобный день вылета',
    targetId: 'landing-calendar-title',
  },
  {
    icon: '🧳',
    title: 'Готовые маршруты',
    description: 'Популярные города — соберите поездку в один клик',
    targetId: 'popular-destinations-grid',
  },
]

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function HomeFeatureCards() {
  return (
    <section className="homeFeatures" aria-label="Возможности сервиса">
      <div className="homeFeatures__grid">
        {FEATURES.map((feature) => (
          <button
            key={feature.title}
            type="button"
            className="homeFeatures__card"
            onClick={() => scrollToSection(feature.targetId)}
          >
            <span className="homeFeatures__icon" aria-hidden>
              {feature.icon}
            </span>
            <span className="homeFeatures__title">{feature.title}</span>
            <span className="homeFeatures__desc">{feature.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
