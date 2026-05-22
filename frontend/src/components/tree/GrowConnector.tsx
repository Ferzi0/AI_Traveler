type Props = {
  visible: boolean
  variant?: 'down' | 'splitHub' | 'branchLeft' | 'branchRight'
  delayMs?: number
}

export function GrowConnector({ visible, variant = 'down', delayMs = 0 }: Props) {
  return (
    <div
      className={`growConnector growConnector--${variant}${visible ? ' growConnector--visible' : ''}`}
      style={{ transitionDelay: `${delayMs}ms` }}
      aria-hidden
    />
  )
}
