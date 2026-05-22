export type FlowNodeId = 'dest' | 'hotels' | 'rooms' | 'flights' | 'baggage' | 'refund'

export type FlowNodePosition = {
  x: number
  y: number
}

/** Позиции в % по X и px по Y — карточки не накладываются, цепочки идут вправо */
export function computeFlowLayout(options: {
  showBranches: boolean
  showRooms: boolean
  showFlightExtras: boolean
}): Partial<Record<FlowNodeId, FlowNodePosition>> {
  const { showBranches, showRooms, showFlightExtras } = options
  const layout: Partial<Record<FlowNodeId, FlowNodePosition>> = {
    dest: { x: 50, y: 0 },
  }

  if (!showBranches) return layout

  const rowY = 160

  if (showRooms && showFlightExtras) {
    layout.hotels = { x: 10, y: rowY }
    layout.rooms = { x: 28, y: rowY }
    layout.flights = { x: 52, y: rowY }
    layout.baggage = { x: 72, y: rowY }
    layout.refund = { x: 90, y: rowY }
  } else if (showRooms) {
    layout.hotels = { x: 14, y: rowY }
    layout.rooms = { x: 34, y: rowY }
    layout.flights = { x: 78, y: rowY }
  } else if (showFlightExtras) {
    layout.hotels = { x: 18, y: rowY }
    layout.flights = { x: 48, y: rowY }
    layout.baggage = { x: 70, y: rowY }
    layout.refund = { x: 88, y: rowY }
  } else {
    layout.hotels = { x: 22, y: rowY }
    layout.flights = { x: 78, y: rowY }
  }

  return layout
}

export function canvasMinWidth(options: {
  showRooms: boolean
  showFlightExtras: boolean
}): number {
  if (options.showRooms && options.showFlightExtras) return 1040
  if (options.showRooms || options.showFlightExtras) return 880
  return 720
}
