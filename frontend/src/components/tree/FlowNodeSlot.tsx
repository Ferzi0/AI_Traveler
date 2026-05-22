import type { ReactNode } from 'react'
import type { FlowNodePosition } from './tripFlowLayout'

type Props = {
  position: FlowNodePosition
  children: ReactNode
}

export function FlowNodeSlot({ position, children }: Props) {
  return (
    <div
      className="flowNodeSlot"
      style={{
        left: `${position.x}%`,
        top: `${position.y}px`,
      }}
    >
      {children}
    </div>
  )
}
