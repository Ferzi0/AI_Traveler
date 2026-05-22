import { useCallback, useLayoutEffect, useState } from 'react'

export type AnchorSide = 'top' | 'bottom' | 'left' | 'right'

export type TreeEdge = {
  from: { nodeId: string; side: AnchorSide }
  to: { nodeId: string; side: AnchorSide }
  visible?: boolean
}

type Point = { x: number; y: number }

function getAnchorPoint(container: HTMLElement, nodeId: string, side: AnchorSide): Point | null {
  const el = container.querySelector(
    `[data-tree-node="${nodeId}"][data-tree-anchor="${side}"]`
  ) as HTMLElement | null
  if (!el) return null
  const containerRect = container.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2 - containerRect.left,
    y: rect.top + rect.height / 2 - containerRect.top,
  }
}

/** Ортогональные «нормальные» чёрные линии между якорями */
function buildOrthogonalPath(
  from: Point,
  to: Point,
  fromSide: AnchorSide,
  toSide: AnchorSide
): string {
  if (fromSide === 'right' && toSide === 'left') {
    const midX = from.x + (to.x - from.x) * 0.5
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`
  }
  if (fromSide === 'left' && toSide === 'right') {
    const midX = from.x + (to.x - from.x) * 0.5
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`
  }
  if (fromSide === 'bottom' && toSide === 'top') {
    const midY = from.y + (to.y - from.y) * 0.5
    return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`
  }
  if (fromSide === 'top' && toSide === 'bottom') {
    const midY = from.y + (to.y - from.y) * 0.5
    return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`
  }
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`
}

type Props = {
  containerRef: React.RefObject<HTMLElement | null>
  edges: TreeEdge[]
}

export function TreeConnectorLines({ containerRef, edges }: Props) {
  const [paths, setPaths] = useState<string[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  const redraw = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    setSize({ w: rect.width, h: rect.height })

    const activeEdges = edges.filter((edge) => edge.visible !== false)
    const nextPaths: string[] = []
    for (const edge of activeEdges) {
      const from = getAnchorPoint(container, edge.from.nodeId, edge.from.side)
      const to = getAnchorPoint(container, edge.to.nodeId, edge.to.side)
      if (from && to) {
        nextPaths.push(buildOrthogonalPath(from, to, edge.from.side, edge.to.side))
      }
    }
    setPaths(nextPaths)
  }, [containerRef, edges])

  useLayoutEffect(() => {
    redraw()
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => redraw())
    ro.observe(container)
    window.addEventListener('resize', redraw)

    const delays = [0, 80, 200, 450, 900]
    const timers = delays.map((ms) => window.setTimeout(redraw, ms))

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', redraw)
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [redraw])

  if (size.w <= 0 || paths.length === 0) return null

  return (
    <svg
      className="treeConnectorLines"
      width={size.w}
      height={size.h}
      aria-hidden
    >
      {paths.map((d, index) => (
        <path key={index} d={d} className="treeConnectorLines__path" />
      ))}
    </svg>
  )
}
