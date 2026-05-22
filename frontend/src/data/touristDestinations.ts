export type TouristDestination = {
  /** Название города для API и каталога */
  title: string
  country: string
  /** Штат, провинция, регион — для США, Канады и т.п. */
  region?: string
  /** Есть полный маршрут в конструкторе (каталог backend) */
  inCatalog?: boolean
}

export const TOURIST_DESTINATIONS: readonly TouristDestination[] = [
  { title: 'Пхукет', country: 'Таиланд', inCatalog: true },
  { title: 'Бангкок', country: 'Таиланд' },
  { title: 'Паттайя', country: 'Таиланд' },
  { title: 'Краби', country: 'Таиланд' },
  { title: 'Лондон', country: 'Великобритания', inCatalog: true },
  { title: 'Эдинбург', country: 'Великобритания' },
  { title: 'Манчестер', country: 'Великобритания' },
  { title: 'Стамбул', country: 'Турция', inCatalog: true },
  { title: 'Анталья', country: 'Турция' },
  { title: 'Измир', country: 'Турция' },
  { title: 'Париж', country: 'Франция' },
  { title: 'Ницца', country: 'Франция' },
  { title: 'Лион', country: 'Франция' },
  { title: 'Марсель', country: 'Франция' },
  { title: 'Рим', country: 'Италия' },
  { title: 'Милан', country: 'Италия' },
  { title: 'Венеция', country: 'Италия' },
  { title: 'Флоренция', country: 'Италия' },
  { title: 'Неаполь', country: 'Италия' },
  { title: 'Барселона', country: 'Испания' },
  { title: 'Мадрид', country: 'Испания' },
  { title: 'Севилья', country: 'Испания' },
  { title: 'Валенсия', country: 'Испания' },
  { title: 'Берлин', country: 'Германия' },
  { title: 'Мюнхен', country: 'Германия' },
  { title: 'Гамбург', country: 'Германия' },
  { title: 'Франкфурт', country: 'Германия' },
  { title: 'Амстердам', country: 'Нидерланды' },
  { title: 'Прага', country: 'Чехия' },
  { title: 'Вена', country: 'Австрия' },
  { title: 'Зальцбург', country: 'Австрия' },
  { title: 'Цюрих', country: 'Швейцария' },
  { title: 'Женева', country: 'Швейцария' },
  { title: 'Лиссабон', country: 'Португалия' },
  { title: 'Порту', country: 'Португалия' },
  { title: 'Афины', country: 'Греция' },
  { title: 'Санторини', country: 'Греция' },
  { title: 'Дубай', country: 'ОАЭ' },
  { title: 'Абу-Даби', country: 'ОАЭ' },
  { title: 'Доха', country: 'Катар' },
  { title: 'Тель-Авив', country: 'Израиль' },
  { title: 'Иерусалим', country: 'Израиль' },
  { title: 'Токио', country: 'Япония' },
  { title: 'Киото', country: 'Япония' },
  { title: 'Осака', country: 'Япония' },
  { title: 'Сеул', country: 'Южная Корея' },
  { title: 'Пекин', country: 'Китай' },
  { title: 'Шанхай', country: 'Китай' },
  { title: 'Гонконг', country: 'Китай' },
  { title: 'Сингапур', country: 'Сингапур' },
  { title: 'Куала-Лумпур', country: 'Малайзия' },
  { title: 'Бали', country: 'Индонезия' },
  { title: 'Джакарта', country: 'Индонезия' },
  { title: 'Ханой', country: 'Вьетнам' },
  { title: 'Хошимин', country: 'Вьетнам' },
  { title: 'Нью-Дели', country: 'Индия' },
  { title: 'Мумбаи', country: 'Индия' },
  { title: 'Гоа', country: 'Индия' },
  { title: 'Каир', country: 'Египет' },
  { title: 'Хургада', country: 'Египет' },
  { title: 'Шарм-эль-Шейх', country: 'Египет' },
  { title: 'Марракеш', country: 'Марокко' },
  { title: 'Кейптаун', country: 'ЮАР' },
  { title: 'Нью-Йорк', country: 'США', region: 'Нью-Йорк' },
  { title: 'Лос-Анджелес', country: 'США', region: 'Калифорния' },
  { title: 'Сан-Франциско', country: 'США', region: 'Калифорния' },
  { title: 'Лас-Вегас', country: 'США', region: 'Невада' },
  { title: 'Майами', country: 'США', region: 'Флорида' },
  { title: 'Орландо', country: 'США', region: 'Флорида' },
  { title: 'Чикаго', country: 'США', region: 'Иллинойс' },
  { title: 'Вашингтон', country: 'США', region: 'Округ Колумбия' },
  { title: 'Бостон', country: 'США', region: 'Массачусетс' },
  { title: 'Сиэтл', country: 'США', region: 'Вашингтон' },
  { title: 'Гонолулу', country: 'США', region: 'Гавайи' },
  { title: 'Торонто', country: 'Канада', region: 'Онтарио' },
  { title: 'Ванкувер', country: 'Канада', region: 'Британская Колумбия' },
  { title: 'Монреаль', country: 'Канада', region: 'Квебек' },
  { title: 'Мехико', country: 'Мексика' },
  { title: 'Канкун', country: 'Мексика' },
  { title: 'Рио-де-Жанейро', country: 'Бразилия' },
  { title: 'Сан-Паулу', country: 'Бразилия' },
  { title: 'Буэнос-Айрес', country: 'Аргентина' },
  { title: 'Сантьяго', country: 'Чили' },
  { title: 'Лима', country: 'Перу' },
  { title: 'Сидней', country: 'Австралия', region: 'Новый Южный Уэльс' },
  { title: 'Мельбурн', country: 'Австралия', region: 'Виктория' },
  { title: 'Окленд', country: 'Новая Зеландия' },
  { title: 'Рейкьявик', country: 'Исландия' },
  { title: 'Осло', country: 'Норвегия' },
  { title: 'Стокгольм', country: 'Швеция' },
  { title: 'Копенгаген', country: 'Дания' },
  { title: 'Хельсинки', country: 'Финляндия' },
  { title: 'Дублин', country: 'Ирландия' },
  { title: 'Брюссель', country: 'Бельгия' },
  { title: 'Будапешт', country: 'Венгрия' },
  { title: 'Варшава', country: 'Польша' },
  { title: 'Краков', country: 'Польша' },
  { title: 'Бухарест', country: 'Румыния' },
  { title: 'София', country: 'Болгария' },
  { title: 'Загреб', country: 'Хорватия' },
  { title: 'Дубровник', country: 'Хорватия' },
  { title: 'Белград', country: 'Сербия' },
  { title: 'Тбилиси', country: 'Грузия' },
  { title: 'Баку', country: 'Азербайджан' },
  { title: 'Ереван', country: 'Армения' },
  { title: 'Алматы', country: 'Казахстан' },
  { title: 'Астана', country: 'Казахстан' },
  { title: 'Ташкент', country: 'Узбекистан' },
  { title: 'Сочи', country: 'Россия' },
  { title: 'Казань', country: 'Россия' },
  { title: 'Санкт-Петербург', country: 'Россия' },
  { title: 'Калининград', country: 'Россия' },
  { title: 'Мальдивы', country: 'Мальдивы' },
  { title: 'Маврикий', country: 'Маврикий' },
  { title: 'Сейшелы', country: 'Сейшелы' },
]

export function formatDestinationLabel(dest: TouristDestination): string {
  if (dest.region) return `${dest.title}, ${dest.region}`
  return `${dest.title}, ${dest.country}`
}

export function destinationHaystack(dest: TouristDestination): string {
  return `${dest.title} ${dest.region ?? ''} ${dest.country} ${formatDestinationLabel(dest)}`.toLowerCase()
}

export function filterTouristDestinations(
  destinations: readonly TouristDestination[],
  query: string,
  limit = 80
): TouristDestination[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const startsWith: TouristDestination[] = []
  const contains: TouristDestination[] = []

  for (const dest of destinations) {
    const hay = destinationHaystack(dest)
    const titleLower = dest.title.toLowerCase()
    if (titleLower.startsWith(q) || hay.startsWith(q)) startsWith.push(dest)
    else if (hay.includes(q)) contains.push(dest)
  }

  return [...startsWith, ...contains].slice(0, limit)
}
