import type { FlowNodePosition } from './tripFlowLayout'

export type DetailFlowNodeId = 'dest' | 'hotel'

export function detailNodeKey(kind: 'hotel-extra' | 'city-transport', category: string): string {
  return `${kind}:${category}`
}

export function parseDetailNodeKey(key: string): { kind: 'hotel-extra' | 'city-transport'; category: string } | null {
  const [kind, ...rest] = key.split(':')
  const category = rest.join(':')
  if ((kind === 'hotel-extra' || kind === 'city-transport') && category) {
    return { kind, category }
  }
  return null
}

export function computeDetailFlowLayout(options: {
  hotelCategories: string[]
  cityCategories: string[]
}): Record<string, FlowNodePosition> {
  const { hotelCategories, cityCategories } = options
  const layout: Record<string, FlowNodePosition> = {
    dest: { x: 50, y: 0 },
  }

  const row2Y = 200
  const row3Y = 440
  const hasHotelBranch = hotelCategories.length > 0
  const hasCityBranch = cityCategories.length > 0

  if (hasHotelBranch) {
    layout.hotel = { x: hasCityBranch ? 26 : 50, y: row2Y }
    hotelCategories.forEach((category, index) => {
      const count = hotelCategories.length
      const x =
        count === 1
          ? layout.hotel!.x
          : 10 + (index * 70) / Math.max(1, count - 1)
      layout[detailNodeKey('hotel-extra', category)] = { x, y: row3Y }
    })
  }

  if (hasCityBranch) {
    cityCategories.forEach((category, index) => {
      const count = cityCategories.length
      const startX = hasHotelBranch ? 60 : 50
      const span = hasHotelBranch ? 28 : Math.min(68, count * 15)
      const x =
        count === 1
          ? startX
          : (hasHotelBranch ? 56 : 16) + (index * span) / Math.max(1, count - 1)
      layout[detailNodeKey('city-transport', category)] = {
        x: Math.min(88, Math.max(hasHotelBranch ? 56 : 12, x)),
        y: hasHotelBranch ? row2Y + 16 : row3Y,
      }
    })
  }

  return layout
}

export function detailCanvasMinWidth(hotelCategories: string[], cityCategories: string[]): number {
  const layout = computeDetailFlowLayout({ hotelCategories, cityCategories })
  const CARD_WIDTH = 196
  const PAD = 20
  let maxX = 50
  for (const pos of Object.values(layout)) {
    maxX = Math.max(maxX, pos.x)
  }
  const needed = (CARD_WIDTH / 2 + PAD) / (1 - maxX / 100)
  return Math.ceil(Math.min(Math.max(needed, 680), 960))
}

/** Absolute nodes do not stretch the canvas — reserve enough height for the lowest row. */
export function detailCanvasMinHeight(
  hotelCategories: string[],
  cityCategories: string[]
): number {
  const layout = computeDetailFlowLayout({ hotelCategories, cityCategories })
  const CARD_HEIGHT = 172
  const PAD = 48
  let maxBottom = 0
  for (const pos of Object.values(layout)) {
    maxBottom = Math.max(maxBottom, pos.y + CARD_HEIGHT)
  }
  return maxBottom + PAD
}
