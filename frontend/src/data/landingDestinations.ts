export type LandingDestination = {
  city: string
  country: string
  imageUrl: string
  price: string
  direct: boolean
  days: number
}

export const LANDING_DESTINATIONS: readonly LandingDestination[] = [
  {
    city: 'Стамбул',
    country: 'Турция',
    imageUrl: '/images/destinations/istanbul.jpg',
    price: '28 400',
    direct: true,
    days: 7,
  },
  {
    city: 'Пхукет',
    country: 'Таиланд',
    imageUrl: '/images/destinations/phuket.jpg',
    price: '54 200',
    direct: false,
    days: 14,
  },
  {
    city: 'Лондон',
    country: 'Великобритания',
    imageUrl: '/images/destinations/london.jpg',
    price: '48 900',
    direct: true,
    days: 7,
  },
  {
    city: 'Париж',
    country: 'Франция',
    imageUrl: '/images/destinations/paris.jpg',
    price: '41 800',
    direct: true,
    days: 5,
  },
  {
    city: 'Дубай',
    country: 'ОАЭ',
    imageUrl: '/images/destinations/dubai.jpg',
    price: '36 900',
    direct: true,
    days: 10,
  },
  {
    city: 'Барселона',
    country: 'Испания',
    imageUrl: '/images/destinations/barcelona.jpg',
    price: '38 500',
    direct: false,
    days: 12,
  },
]
