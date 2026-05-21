type Page = 'history' | 'favorites' | 'profile' | null

type Props = {
  open: boolean
  onNavigate: (page: Page) => void
  onClose: () => void
  onLogout: () => void
}

export function SideMenu({ open, onNavigate, onClose, onLogout }: Props) {
  if (!open) return null

  return (
    <>
      <div className="menuOverlay" onClick={onClose} />
      <nav className="sideMenu">
        <button type="button" className="menuItem" onClick={() => { onNavigate('profile'); onClose() }}>
          Профиль
        </button>
        <button type="button" className="menuItem" onClick={() => { onNavigate('favorites'); onClose() }}>
          Избранное
        </button>
        <button type="button" className="menuItem" onClick={() => { onNavigate('history'); onClose() }}>
          История поездок
        </button>
        <div className="menuDivider" />
        <button type="button" className="menuItem menuItemDanger" onClick={() => { onLogout(); onClose() }}>
          Выйти
        </button>
      </nav>
    </>
  )
}
