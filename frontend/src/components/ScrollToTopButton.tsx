import { useEffect, useState, type RefObject } from 'react'

type Props = {
  
  scrollRoot?: RefObject<HTMLElement | null>
  
  bottom?: string
}

function readScrollTop(scrollRoot?: RefObject<HTMLElement | null>): number {
  if (scrollRoot?.current) return scrollRoot.current.scrollTop
  return window.scrollY || document.documentElement.scrollTop
}

function scrollToTop(scrollRoot?: RefObject<HTMLElement | null>) {
  if (scrollRoot?.current) {
    scrollRoot.current.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function ScrollToTopButton({ scrollRoot, bottom = '1.25rem' }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = scrollRoot?.current ?? window
    const onScroll = () => setVisible(readScrollTop(scrollRoot) > 320)

    onScroll()
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [scrollRoot])

  if (!visible) return null

  return (
    <button
      type="button"
      className="scrollToTopBtn"
      style={{ bottom }}
      aria-label="Наверх"
      onClick={() => scrollToTop(scrollRoot)}
    >
      ↑
    </button>
  )
}
