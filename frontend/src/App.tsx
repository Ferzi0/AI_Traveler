import { useEffect, useMemo, useState } from 'react'
import { TransportDetailsPanel } from './components/TransportDetailsPanel'
import { TripFlowTree } from './components/TripFlowTree'
import type { HotelSearchFilters } from './components/panels/HotelExplorerPanel'
import type { FlightSearchFilters } from './components/panels/FlightExplorerPanel'
import { AppFooter } from './components/AppFooter'
import { ScrollToTopButton } from './components/ScrollToTopButton'
import { SideMenu } from './components/SideMenu'
import { HistoryPage } from './components/HistoryPage'
import { FavoritesPage } from './components/FavoritesPage'
import { ProfilePage } from './components/ProfilePage'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { BrandLogo } from './components/BrandLogo'
import { LandingPage } from './components/LandingPage'
import type {
  AccommodationItem,
  AccommodationSearchResponse,
  DestinationItem,
  RoomItem,
  TransportExtrasResponse,
  TransportItinerary,
  TripSummary,
} from './types/trip'
import { api, AUTH_EXPIRED_EVENT, clearAuthToken } from './api'
import { formatCalculationMeta } from './utils/cost'
import { destinationCoverImage } from './data/imageCatalog'
import { imageBackgroundStyle } from './utils/images'
import { CityCombobox } from './components/CityCombobox'
import { DestinationSearch } from './components/DestinationSearch'
import type { TouristDestination } from './data/touristDestinations'
import { RUSSIAN_CITIES } from './data/russianCities'
import type { UserProfile } from './types/user'
import type { FavoriteCreatePayload, FavoriteItem } from './types/favorites'
import { favoriteKey } from './types/favorites'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [origin, setOrigin] = useState('Москва')
  const [tripId, setTripId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('2026-06-10')
  const [endDate, setEndDate] = useState('2026-06-17')
  const [passengers, setPassengers] = useState(2)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState<'history' | 'favorites' | 'profile' | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [authScreen, setAuthScreen] = useState<'landing' | 'login' | 'register'>('landing')

  const [destinationQuery, setDestinationQuery] = useState('')
  const [destinations, setDestinations] = useState<DestinationItem[]>([])
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | null>(null)

  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [transport, setTransport] = useState<TransportItinerary[]>([])
  const [transportExtras, setTransportExtras] = useState<TransportExtrasResponse | null>(null)

  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedTransportId, setSelectedTransportId] = useState('')
  const [selectedTransportExtraIds, setSelectedTransportExtraIds] = useState<Record<string, string>>(
    {}
  )
  const [detailsItinerary, setDetailsItinerary] = useState<TransportItinerary | null>(null)

  const [summary, setSummary] = useState<TripSummary | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set())

  const total = useMemo(() => summary?.total_estimated_cost ?? 0, [summary])

  const canSaveTrip = Boolean(
    selectedDestination &&
      selectedHotelId &&
      selectedRoomId &&
      selectedTransportId &&
      selectedTransportExtraIds.baggage &&
      selectedTransportExtraIds.refund_policy
  )

  useEffect(() => {
    function onAuthExpired() {
      setToken(null)
      setCurrentUser(null)
      setError('')
      setAuthScreen('login')
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
  }, [])

  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      return
    }
    void api<UserProfile>('/auth/me')
      .then(setCurrentUser)
      .catch(() => {
        clearAuthToken()
        setToken(null)
        setCurrentUser(null)
      })
  }, [token])

  useEffect(() => {
    if (!currentUser?.default_origin) return
    if (RUSSIAN_CITIES.includes(currentUser.default_origin)) {
      setOrigin(currentUser.default_origin)
    }
  }, [currentUser?.default_origin])

  useEffect(() => {
    if (!token) {
      setFavorites([])
      setFavoriteKeys(new Set())
      return
    }
    void loadFavorites()
  }, [token])

  async function loadFavorites() {
    try {
      const res = await api<{ items: FavoriteItem[] }>('/favorites')
      setFavorites(res.items)
      setFavoriteKeys(new Set(res.items.map((f) => favoriteKey(f.item_type, f.item_key))))
    } catch {
      setFavorites([])
      setFavoriteKeys(new Set())
    }
  }

  function isFavorite(itemType: 'city' | 'hotel', itemKey: string) {
    return favoriteKeys.has(favoriteKey(itemType, itemKey))
  }

  async function toggleFavorite(
    itemType: 'city' | 'hotel',
    itemKey: string,
    meta: { title: string; subtitle?: string; country?: string; imageUrls?: string[] }
  ) {
    const key = favoriteKey(itemType, itemKey)
    const existing = favorites.find((f) => favoriteKey(f.item_type, f.item_key) === key)
    setError('')
    try {
      if (existing) {
        await api(`/favorites/${existing.id}`, 'DELETE')
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id))
        setFavoriteKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      } else {
        const payload: FavoriteCreatePayload = {
          item_type: itemType,
          item_key: itemKey,
          title: meta.title,
          subtitle: meta.subtitle ?? null,
          country: meta.country ?? null,
          image_urls: meta.imageUrls ?? [],
        }
        const created = await api<FavoriteItem>('/favorites', 'POST', payload)
        setFavorites((prev) => [created, ...prev])
        setFavoriteKeys((prev) => new Set(prev).add(key))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка избранного')
    }
  }

  async function removeFavorite(id: number) {
    setError('')
    try {
      await api(`/favorites/${id}`, 'DELETE')
      setFavorites((prev) => {
        const removed = prev.find((f) => f.id === id)
        if (removed) {
          setFavoriteKeys((keys) => {
            const next = new Set(keys)
            next.delete(favoriteKey(removed.item_type, removed.item_key))
            return next
          })
        }
        return prev.filter((f) => f.id !== id)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить')
    }
  }

  async function saveTrip() {
    if (!tripId || !canSaveTrip) return
    setLoading(true)
    setSaveMessage('')
    setError('')
    try {
      await api('/history', 'POST', { trip_id: tripId })
      setSaveMessage('Поездка сохранена в истории')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить поездку')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!tripId || !selectedDestination) return
    void (async () => {
      try {
        await api(`/trips/${tripId}/params`, 'PATCH', {
          origin,
          start_date: startDate,
          end_date: endDate,
          passengers,
          round_trip: true,
        })
        await refreshSummary()
      } catch {
      }
    })()
  }, [passengers])

  async function refreshSummary() {
    if (!tripId) return
    setSummary(await api<TripSummary>(`/trips/${tripId}/summary`))
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setActivePage(null)
  }

  async function ensureTrip() {
    const params = {
      origin,
      start_date: startDate,
      end_date: endDate,
      passengers,
      round_trip: true,
    }
    if (tripId) {
      try {
        await api(`/trips/${tripId}/params`, 'PATCH', params)
        return tripId
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка обновления параметров')
        return null
      }
    }
    setLoading(true)
    setError('')
    try {
      const created = await api<{ id: number }>('/trips', 'POST', {
        title: 'Новая поездка',
        destination: '',
      })
      await api(`/trips/${created.id}/params`, 'PATCH', params)
      setTripId(created.id)
      return created.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания поездки')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function searchDestinations(query = destinationQuery) {
    const id = tripId ?? (await ensureTrip())
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const found = await api<{ items: DestinationItem[] }>(
        `/trips/destination/search?query=${encodeURIComponent(query)}`
      )
      setDestinations(found.items)
      return found.items
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска')
      return []
    } finally {
      setLoading(false)
    }
  }

  async function handleDestinationSuggest(dest: TouristDestination) {
    setDestinationQuery(dest.title)
    if (!dest.inCatalog) {
      setDestinations([])
      setError('Маршрут для этого города скоро появится. Сейчас доступны: Пхукет, Лондон, Стамбул.')
      return
    }
    setError('')
    const items = await searchDestinations(dest.title)
    const match = items?.find((item) => item.title === dest.title)
    if (match) {
      await pickDestination(match)
    }
  }

  async function pickDestination(item: DestinationItem) {
    const id = tripId ?? (await ensureTrip())
    if (!id) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${id}/destination/select`, 'POST', { destination_title: item.title })
      const hotels = await api<AccommodationSearchResponse>(
        `/trips/${id}/accommodations/search`,
        'POST',
        { kinds: ['hotel', 'hostel'], sort_by: 'price' }
      )
      const flights = await api<{ items: TransportItinerary[] }>(
        `/trips/${id}/transport/search`,
        'POST',
        { sort_by: 'price' }
      )
      setSelectedDestination(item)
      setAccommodations(hotels.items)
      setTransport(flights.items)
      setSelectedHotelId('')
      setSelectedRoomId('')
      setSelectedTransportId('')
      setSelectedTransportExtraIds({})
      setTransportExtras(null)
      setRooms([])
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора направления')
    } finally {
      setLoading(false)
    }
  }

  async function searchHotels(filters: HotelSearchFilters) {
    if (!tripId) throw new Error('Нет поездки')
    return api<AccommodationSearchResponse>(`/trips/${tripId}/accommodations/search`, 'POST', {
      kinds: ['hotel', 'hostel'],
      sort_by: filters.sort_by,
      stars_min: filters.stars_min,
      stars_max: filters.stars_max,
      breakfast_included: filters.breakfast_included || undefined,
      has_pool: filters.has_pool || undefined,
    })
  }

  async function pickHotel(hotelId: string) {
    if (!tripId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/accommodations/select`, 'POST', { item_id: hotelId })
      setSelectedHotelId(hotelId)
      setSelectedRoomId('')
      const roomList = await api<{ items: RoomItem[] }>(
        `/trips/${tripId}/accommodations/rooms`,
        'POST',
        { accommodation_id: hotelId, sort_by: 'price' }
      )
      setRooms(roomList.items)
      if (roomList.items.length === 0) {
        setError('Нет номеров под ваши даты и число гостей')
      }
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора отеля')
    } finally {
      setLoading(false)
    }
  }

  async function searchRooms(sortBy: string) {
    if (!tripId || !selectedHotelId) return []
    const roomList = await api<{ items: RoomItem[] }>(
      `/trips/${tripId}/accommodations/rooms`,
      'POST',
      { accommodation_id: selectedHotelId, sort_by: sortBy }
    )
    return roomList.items
  }

  async function pickRoom(roomId: string, accommodationId: string) {
    if (!tripId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/accommodations/select-room`, 'POST', {
        accommodation_id: accommodationId,
        room_id: roomId,
      })
      setSelectedRoomId(roomId)
      setSelectedHotelId(accommodationId)
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора номера')
    } finally {
      setLoading(false)
    }
  }

  async function searchFlights(filters: FlightSearchFilters) {
    if (!tripId) throw new Error('Нет поездки')
    const res = await api<{ items: TransportItinerary[] }>(
      `/trips/${tripId}/transport/search`,
      'POST',
      {
        sort_by: filters.sort_by,
        price_from: filters.price_from ?? undefined,
        price_to: filters.price_to ?? undefined,
      }
    )
    return res.items
  }

  async function pickTransport(itineraryId: string) {
    if (!tripId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/transport/select`, 'POST', { itinerary_id: itineraryId })
      setSelectedTransportId(itineraryId)
      setDetailsItinerary(null)
      const extras = await api<TransportExtrasResponse>(
        `/trips/${tripId}/transport/${itineraryId}/extras`
      )
      setTransportExtras(extras)
      setSelectedTransportExtraIds({})
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора рейса')
    } finally {
      setLoading(false)
    }
  }

  async function pickTransportExtra(category: string, itemId: string) {
    if (!tripId || !selectedTransportId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/transport/${selectedTransportId}/extras/select`, 'POST', {
        category,
        item_id: itemId,
      })
      setSelectedTransportExtraIds((prev) => ({ ...prev, [category]: itemId }))
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора опции перелёта')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    if (authScreen === 'register') {
      return (
        <RegisterPage
          onSuccess={() => setAuthScreen('login')}
          onGoLogin={() => setAuthScreen('login')}
        />
      )
    }
    if (authScreen === 'login') {
      return (
        <LoginPage
          onSuccess={(t) => { setToken(t); setAuthScreen('landing') }}
          onGoRegister={() => setAuthScreen('register')}
        />
      )
    }
    return (
      <LandingPage
        onLogin={() => setAuthScreen('login')}
        onRegister={() => setAuthScreen('register')}
      />
    )
  }
  return (
    <>
      {activePage === 'history' && <HistoryPage onClose={() => setActivePage(null)} />}
      {activePage === 'favorites' && (
        <FavoritesPage
          items={favorites}
          loading={false}
          onClose={() => setActivePage(null)}
          onRemove={(id) => void removeFavorite(id)}
        />
      )}
      {activePage === 'profile' && (
        <ProfilePage
          onClose={() => setActivePage(null)}
          onLogout={handleLogout}
          onUpdated={setCurrentUser}
        />
      )}

      <div className="app">
        <header className="topBar">
          <div className="topBarInner">
            <button
              type="button"
              className="logo logoBtn"
              onClick={() => {
                setActivePage(null)
                setMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              aria-label="На главную"
            >
              <BrandLogo />
            </button>
            <div className="menuWrap">
              <button type="button" className="menuBtn" onClick={() => setMenuOpen(v => !v)}>☰</button>
              <SideMenu
                open={menuOpen}
                onNavigate={setActivePage}
                onClose={() => setMenuOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        <main className="main">
          {error ? <div className="errorBanner">{error}</div> : null}

          <div className="paramsBar">
            <div className="paramsCell paramsCell--origin">
              <label htmlFor="origin">Откуда</label>
              <CityCombobox id="origin" value={origin} onChange={setOrigin} />
            </div>
            <div className="paramsCell">
              <label htmlFor="start">Когда</label>
              <input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="paramsCell">
              <label htmlFor="end">Обратно</label>
              <input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="paramsCell">
              <label htmlFor="passengers">Пассажиры</label>
              <input
                id="passengers"
                type="number"
                min={1}
                max={12}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              />
            </div>
          </div>

          {!selectedDestination ? (
            <section className="destinationHero" aria-labelledby="destination-hero-title">
              <h1 id="destination-hero-title" className="destinationHero__title">
                Куда отправимся?
              </h1>
              <div className="destinationHero__card">
                <div className="destinationHero__search">
                  <DestinationSearch
                    value={destinationQuery}
                    onChange={setDestinationQuery}
                    onSelect={(dest) => void handleDestinationSuggest(dest)}
                    disabled={loading}
                    placeholder="Пхукет, Лондон, Стамбул…"
                  />
                  <button
                    type="button"
                    className="btn destinationHero__btn"
                    disabled={loading}
                    onClick={() => void searchDestinations()}
                  >
                    Найти
                  </button>
                </div>
              </div>
              {destinations.length > 0 ? (
                <div className="destinationHero__results destPickerCards">
                  {destinations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="destCard destCard--pick"
                      disabled={loading}
                      onClick={() => void pickDestination(item)}
                    >
                      <div
                        className="destCard__img"
                        style={imageBackgroundStyle(destinationCoverImage(item))}
                      >
                        {!item.image_url ? <span className="destCard__emoji">🌍</span> : null}
                      </div>
                      <div className="destCard__body">
                        <div className="destCard__city">{item.title}</div>
                        <div className="destCard__country">{item.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          ) : tripId && selectedDestination ? (
            <TripFlowTree
              destination={selectedDestination}
              tripId={tripId}
              passengers={passengers}
              loading={loading}
              accommodations={accommodations}
              rooms={rooms}
              transport={transport}
              transportExtras={transportExtras}
              selectedHotelId={selectedHotelId}
              selectedRoomId={selectedRoomId}
              selectedTransportId={selectedTransportId}
              selectedTransportExtraIds={selectedTransportExtraIds}
              onSearchHotels={searchHotels}
              onPickHotel={pickHotel}
              onSearchRooms={searchRooms}
              onPickRoom={pickRoom}
              onSearchFlights={searchFlights}
              onPickFlight={pickTransport}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onPickTransportExtra={pickTransportExtra}
              onShowFlightDetails={setDetailsItinerary}
            />
          ) : null}
        </main>

        {selectedDestination ? (
          <div className="appSummaryBar">
            {saveMessage ? <p className="saveTripMessage">{saveMessage}</p> : null}
            <div className="summaryDock">
              <div className="summaryInner">
                <button type="button" className="summaryPill" onClick={() => setShowBreakdown((v) => !v)}>
                  <span>
                    Приблизительная сумма: ${total}
                    {passengers > 1 ? ` · ${passengers} пасс.` : ''}
                  </span>
                  <span aria-hidden>{showBreakdown ? '▲' : '▼'}</span>
                </button>
                {showBreakdown && summary ? (
                  <div className="breakdown">
                    {summary.calculation.items.length === 0 ? (
                      <p className="breakdownItem">Выберите номер и рейс в дереве</p>
                    ) : (
                      summary.calculation.items.map((item) => (
                        <div key={`${item.node_type}-${item.title}`} className="breakdownItem">
                          <strong>{item.title}</strong>
                          <span className="meta">{formatCalculationMeta(item)}</span>
                          <span className="price">${item.result}</span>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="btn saveTripBtn"
              disabled={loading || !canSaveTrip}
              onClick={() => void saveTrip()}
            >
              Сохранить поездку
            </button>
          </div>
        ) : null}

        <AppFooter />

        <ScrollToTopButton bottom={selectedDestination ? '6.5rem' : '1.25rem'} />

        {detailsItinerary ? (
          <TransportDetailsPanel
            itinerary={detailsItinerary}
            onClose={() => setDetailsItinerary(null)}
          />
        ) : null}
      </div>
    </>
  )
}
export default App