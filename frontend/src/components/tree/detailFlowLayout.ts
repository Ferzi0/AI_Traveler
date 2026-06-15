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

  const row2Y = 150
  const row3Y = 300
  const hasHotelBranch = hotelCategories.length > 0
  const hasCityBranch = cityCategories.length > 0

  if (hasHotelBranch) {
    layout.hotel = { x: hasCityBranch ? 24 : 50, y: row2Y }
    hotelCategories.forEach((category, index) => {
      const count = hotelCategories.length
      const x =
        count === 1
          ? layout.hotel!.x
          : 8 + (index * 76) / Math.max(1, count - 1)
      layout[detailNodeKey('hotel-extra', category)] = { x, y: row3Y }
    })
  }

  if (hasCityBranch) {
    cityCategories.forEach((category, index) => {
      const count = cityCategories.length
      const startX = hasHotelBranch ? 58 : 50
      const span = hasHotelBranch ? 34 : Math.min(70, count * 16)
      const x =
        count === 1
          ? startX
          : (hasHotelBranch ? 52 : 18) + (index * span) / Math.max(1, count - 1)
      layout[detailNodeKey('city-transport', category)] = {
        x: Math.min(92, Math.max(hasHotelBranch ? 52 : 12, x)),
        y: hasHotelBranch ? row2Y : row3Y,
      }
    })
  }

  return layout
}

export function detailCanvasMinWidth(hotelCategories: string[], cityCategories: string[]): number {
  const total = 2 + hotelCategories.length + cityCategories.length
  if (total >= 8) return 1040
  if (total >= 6) return 920
  return 760
}

/** Absolute nodes do not stretch the canvas — reserve enough height for the lowest row. */
export function detailCanvasMinHeight(
  hotelCategories: string[],
  cityCategories: string[]
): number {
  const layout = computeDetailFlowLayout({ hotelCategories, cityCategories })
  const CARD_HEIGHT = 152
  const PAD = 36
  let maxBottom = 0
  for (const pos of Object.values(layout)) {
    maxBottom = Math.max(maxBottom, pos.y + CARD_HEIGHT)
  }
  return maxBottom + PAD
}
