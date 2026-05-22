import { useEffect, useMemo, useState } from 'react'
import { TransportDetailsPanel } from './components/TransportDetailsPanel'
import { TreeBranch, TreeConnector, TreeLevel, TreeNode, TripTree } from './components/TripTree'
import { AppFooter } from './components/AppFooter'
import { SideMenu } from './components/SideMenu'
import { HistoryPage } from './components/HistoryPage'
import { FavoritesPage } from './components/FavoritesPage'
import { ProfilePage } from './components/ProfilePage'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import type {
  AccommodationItem,
  CityTransportResponse,
  DayPlanResponse,
  DestinationItem,
  HotelExtrasResponse,
  RoomItem,
  TransportExtrasResponse,
  TransportItinerary,
  TripSummary,
} from './types/trip'
import { api } from './api'
import {
  appendCostToSubtitle,
  formatCalculationMeta,
  formatCatalogPerPersonCost,
  roundMoney,
} from './utils/cost'
import { CityCombobox } from './components/CityCombobox'
import { DestinationSearch } from './components/DestinationSearch'
import type { TouristDestination } from './data/touristDestinations'
import { RUSSIAN_CITIES } from './data/russianCities'
import type { UserProfile } from './types/user'
import './App.css'

type AccPhase = 'idle' | 'hotels' | 'rooms' | 'extras'
type TransportPhase = 'idle' | 'flights' | 'extras'
type CityTransportPhase = 'idle' | 'options'
type DayPlanPhase = 'idle' | 'days' | 'slots'

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

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
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login')

  const [destinationQuery, setDestinationQuery] = useState('')
  const [destinations, setDestinations] = useState<DestinationItem[]>([])
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | null>(null)

  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([])
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [transport, setTransport] = useState<TransportItinerary[]>([])
  const [hotelExtras, setHotelExtras] = useState<HotelExtrasResponse | null>(null)
  const [transportExtras, setTransportExtras] = useState<TransportExtrasResponse | null>(null)
  const [cityTransport, setCityTransport] = useState<CityTransportResponse | null>(null)
  const [dayPlan, setDayPlan] = useState<DayPlanResponse | null>(null)

  const [accPhase, setAccPhase] = useState<AccPhase>('idle')
  const [transportPhase, setTransportPhase] = useState<TransportPhase>('idle')
  const [cityTransportPhase, setCityTransportPhase] = useState<CityTransportPhase>('idle')
  const [dayPlanPhase, setDayPlanPhase] = useState<DayPlanPhase>('idle')
  const [activeExtraCategory, setActiveExtraCategory] = useState('')
  const [activeTransportExtraCategory, setActiveTransportExtraCategory] = useState('')
  const [activeCityTransportCategory, setActiveCityTransportCategory] = useState('')
  const [activeDayKey, setActiveDayKey] = useState('')
  const [activeDaySlot, setActiveDaySlot] = useState('')

  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedTransportId, setSelectedTransportId] = useState('')
  const [selectedExtraIds, setSelectedExtraIds] = useState<Record<string, string>>({})
  const [selectedTransportExtraIds, setSelectedTransportExtraIds] = useState<Record<string, string>>(
    {}
  )
  const [selectedCityTransportIds, setSelectedCityTransportIds] = useState<Record<string, string>>({})
  const [selectedDayPlanIds, setSelectedDayPlanIds] = useState<Record<string, string>>({})
  const [detailsItinerary, setDetailsItinerary] = useState<TransportItinerary | null>(null)

  const [summary, setSummary] = useState<TripSummary | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = useMemo(() => summary?.total_estimated_cost ?? 0, [summary])

  useEffect(() => {
    if (!token) {
      setCurrentUser(null)
      return
    }
    void api<UserProfile>('/auth/me')
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
  }, [token])

  useEffect(() => {
    if (!currentUser?.default_origin) return
    if (RUSSIAN_CITIES.includes(currentUser.default_origin)) {
      setOrigin(currentUser.default_origin)
    }
  }, [currentUser?.default_origin])

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
        /* summary обновится при следующем выборе в дереве */
      }
    })()
  }, [passengers])

  const selectedHotel = accommodations.find((h) => h.id === selectedHotelId)
  const selectedTransport = transport.find((t) => t.itinerary_id === selectedTransportId)

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
      const hotels = await api<{ items: AccommodationItem[] }>(
        `/trips/${id}/accommodations/search`,
        'POST',
        { kinds: ['hotel', 'hostel'], sort_by: 'rating' }
      )
      const flights = await api<{ items: TransportItinerary[] }>(
        `/trips/${id}/transport/search`,
        'POST',
        { sort_by: 'price' }
      )
      const cityOptions = await api<CityTransportResponse>(`/trips/${id}/city-transport/options`)
      const dayPlanOptions = await api<DayPlanResponse>(`/trips/${id}/day-plan/options`)
      setSelectedDestination(item)
      setAccommodations(hotels.items)
      setTransport(flights.items)
      setCityTransport(cityOptions)
      setDayPlan(dayPlanOptions)
      setAccPhase('idle')
      setTransportPhase('idle')
      setCityTransportPhase('idle')
      setDayPlanPhase('idle')
      setSelectedHotelId('')
      setSelectedRoomId('')
      setSelectedTransportId('')
      setSelectedExtraIds({})
      setSelectedTransportExtraIds({})
      setSelectedCityTransportIds({})
      setSelectedDayPlanIds({})
      setHotelExtras(null)
      setTransportExtras(null)
      setActiveExtraCategory('')
      setActiveTransportExtraCategory('')
      setActiveCityTransportCategory(cityOptions.categories[0]?.category ?? '')
      setActiveDayKey(dayPlanOptions.days[0]?.day_key ?? '')
      setActiveDaySlot(dayPlanOptions.days[0]?.slots[0]?.slot ?? '')
      setRooms([])
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора направления')
    } finally {
      setLoading(false)
    }
  }

  async function openAccommodationBranch() {
    if (accommodations.length === 0) return
    setAccPhase(selectedRoomId && hotelExtras ? 'extras' : selectedHotelId ? 'rooms' : 'hotels')
    setTransportPhase('idle')
    setCityTransportPhase('idle')
    setDayPlanPhase('idle')
  }

  function toggleAccommodationBranch() {
    if (accPhase !== 'idle') {
      setAccPhase('idle')
      return
    }
    void openAccommodationBranch()
  }

  async function openHotel(hotelId: string) {
    if (!tripId) return
    setSelectedHotelId(hotelId)
    setAccPhase('rooms')
    setLoading(true)
    setError('')
    try {
      const roomList = await api<{ items: RoomItem[] }>(
        `/trips/${tripId}/accommodations/rooms`,
        'POST',
        { accommodation_id: hotelId, sort_by: 'price' }
      )
      setRooms(roomList.items)
      if (roomList.items.length === 0) {
        setError('Нет номеров под ваши даты и число гостей')
      } else {
        setAccPhase('rooms')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки номеров')
    } finally {
      setLoading(false)
    }
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
      setSelectedExtraIds({})
      const extras = await api<HotelExtrasResponse>(
        `/trips/${tripId}/accommodations/${accommodationId}/extras`
      )
      setHotelExtras(extras)
      setActiveExtraCategory(extras.categories[0]?.category ?? '')
      setAccPhase('extras')
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора номера')
    } finally {
      setLoading(false)
    }
  }

  function openTransportBranch() {
    setTransportPhase(selectedTransportId && transportExtras ? 'extras' : 'flights')
    setAccPhase('idle')
    setCityTransportPhase('idle')
    setDayPlanPhase('idle')
  }

  function toggleTransportBranch() {
    if (transportPhase !== 'idle') {
      setTransportPhase('idle')
      return
    }
    openTransportBranch()
  }

  function openCityTransportBranch() {
    setCityTransportPhase('options')
    setAccPhase('idle')
    setTransportPhase('idle')
    setDayPlanPhase('idle')
  }

  function toggleCityTransportBranch() {
    if (cityTransportPhase !== 'idle') {
      setCityTransportPhase('idle')
      return
    }
    openCityTransportBranch()
  }

  function openDayPlanBranch() {
    setDayPlanPhase(activeDayKey ? 'slots' : 'days')
    setAccPhase('idle')
    setTransportPhase('idle')
    setCityTransportPhase('idle')
  }

  function toggleDayPlanBranch() {
    if (dayPlanPhase !== 'idle') {
      setDayPlanPhase('idle')
      return
    }
    openDayPlanBranch()
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
      setActiveTransportExtraCategory(extras.categories[0]?.category ?? '')
      setSelectedTransportExtraIds({})
      setTransportPhase('extras')
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора рейса')
    } finally {
      setLoading(false)
    }
  }

  const accNodeTitle =
    accPhase === 'rooms' && selectedHotel
      ? selectedHotel.title
      : accPhase === 'extras' && selectedHotel
        ? selectedHotel.title
      : accPhase === 'hotels'
        ? 'Выберите отель'
        : selectedRoomId && selectedHotel
          ? selectedHotel.title
          : 'Место проживания'

  const accNodeSubtitle =
    accPhase === 'rooms' || selectedRoomId
      ? 'Проживание'
      : accPhase === 'extras'
        ? 'Дополнения к отелю'
      : accPhase === 'hotels'
        ? 'Список отелей'
        : 'Подобрать отель'

  const activeExtraItems =
    hotelExtras?.categories.find((category) => category.category === activeExtraCategory)?.items ?? []

  async function pickHotelExtra(category: string, itemId: string) {
    if (!tripId || !selectedHotelId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/accommodations/${selectedHotelId}/extras/select`, 'POST', {
        category,
        item_id: itemId,
      })
      setSelectedExtraIds((prev) => ({ ...prev, [category]: itemId }))
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора доп. опции')
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

  async function pickCityTransport(category: string, itemId: string) {
    if (!tripId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/city-transport/select`, 'POST', {
        category,
        item_id: itemId,
      })
      setSelectedCityTransportIds((prev) => ({ ...prev, [category]: itemId }))
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора транспорта по городу')
    } finally {
      setLoading(false)
    }
  }

  async function pickDayPlanItem(dayKey: string, slot: string, itemId: string) {
    if (!tripId) return
    setLoading(true)
    setError('')
    try {
      await api(`/trips/${tripId}/day-plan/select`, 'POST', {
        day_key: dayKey,
        slot,
        item_id: itemId,
      })
      setSelectedDayPlanIds((prev) => ({ ...prev, [`${dayKey}:${slot}`]: itemId }))
      await refreshSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выбора активности дня')
    } finally {
      setLoading(false)
    }
  }

  const transportNodeTitle = selectedTransport
    ? selectedTransport.outbound.title.replace('Авиаперелет ', '')
    : transportPhase === 'flights'
      ? 'Выберите рейс'
      : 'Рейсы'

  const transportNodeSubtitle = selectedTransport
    ? `${formatCatalogPerPersonCost(
        roundMoney(selectedTransport.total_price / Math.max(1, passengers)),
        passengers
      )} · ${formatDuration(selectedTransport.total_duration_min)}`
    : transportPhase === 'flights'
      ? 'Авиабилеты'
      : 'Авиабилеты'

  const activeTransportExtraItems =
    transportExtras?.categories.find((category) => category.category === activeTransportExtraCategory)
      ?.items ?? []

  const activeCityTransportItems =
    cityTransport?.categories.find((category) => category.category === activeCityTransportCategory)?.items ??
    []

  const activeDay = dayPlan?.days.find((day) => day.day_key === activeDayKey)
  const activeDaySlots = activeDay?.slots ?? []
  const activeDaySlotItems =
    activeDaySlots.find((slot) => slot.slot === activeDaySlot)?.items ?? []

  if (!token) {
    if (authScreen === 'register') {
      return <RegisterPage onSuccess={() => setAuthScreen('login')} onGoLogin={() => setAuthScreen('login')} />
    }
    return <LoginPage onSuccess={(t) => setToken(t)} onGoRegister={() => setAuthScreen('register')} />
  }
  return (
    <>
      {activePage === 'history' && (
        <HistoryPage onClose={() => setActivePage(null)} onOpen={(id) => console.log(id)} />
      )}
      {activePage === 'favorites' && (
        <FavoritesPage onClose={() => setActivePage(null)} onRemove={(id) => console.log(id)} />
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
            <span className="logo">AI TRAVELER</span>
            <button type="button" className="menuBtn" onClick={() => setMenuOpen(v => !v)}>☰</button>
            <SideMenu
              open={menuOpen}
              onNavigate={setActivePage}
              onClose={() => setMenuOpen(false)}
              onLogout={handleLogout}
            />
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
            <>
              <div className="searchRow">
                <DestinationSearch
                  value={destinationQuery}
                  onChange={setDestinationQuery}
                  onSelect={(dest) => void handleDestinationSuggest(dest)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btnGhost"
                  disabled={loading}
                  onClick={() => void searchDestinations()}
                >
                  Найти
                </button>
              </div>
              {destinations.length > 0 ? (
                <div className="destPicker">
                  {destinations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="destChip"
                      disabled={loading}
                      onClick={() => void pickDestination(item)}
                    >
                      {item.title}, {item.country}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="emptyTree">Куда отправимся?</p>
              )}
            </>
          ) : (
            <TripTree>
              <TreeLevel>
                <TreeNode
                  variant="root"
                  title={selectedDestination.title}
                  subtitle={selectedDestination.country}
                />
              </TreeLevel>

              <TreeConnector variant="down" />

              <TreeConnector variant="split" />

              <TreeLevel>
                <TreeBranch>
                  <TreeConnector variant="down" />
                  <TreeNode
                    title={accNodeTitle}
                    subtitle={accNodeSubtitle}
                    active={accPhase !== 'idle' && !selectedRoomId}
                    selected={Boolean(selectedRoomId)}
                    onClick={toggleAccommodationBranch}
                    disabled={loading}
                  />

                  {accPhase === 'hotels' ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {accommodations.map((hotel) => (
                          <TreeNode
                            key={hotel.id}
                            title={hotel.title}
                            subtitle={`★ ${hotel.rating} · от $${hotel.price}`}
                            active={selectedHotelId === hotel.id && !selectedRoomId}
                            onClick={() => void openHotel(hotel.id)}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                    </>
                  ) : null}

                  {accPhase === 'rooms' && rooms.length > 0 ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel columns={rooms.length}>
                        {rooms.map((room, index) => (
                          <TreeNode
                            key={room.room_id}
                            variant="leaf"
                            title={`Номер #${index + 1}`}
                            subtitle={`${room.room_name} · $${room.price_total}`}
                            selected={selectedRoomId === room.room_id}
                            onClick={() => void pickRoom(room.room_id, room.accommodation_id)}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                    </>
                  ) : null}

                  {accPhase === 'extras' && hotelExtras ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {hotelExtras.categories.map((category) => (
                          <TreeNode
                            key={category.category}
                            variant="leaf"
                            title={category.title}
                            subtitle={
                              selectedExtraIds[category.category]
                                ? 'Выбрано'
                                : `${category.items.length} вариантов`
                            }
                            active={activeExtraCategory === category.category}
                            selected={Boolean(selectedExtraIds[category.category])}
                            onClick={() => setActiveExtraCategory(category.category)}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                      {activeExtraItems.length > 0 ? (
                        <>
                          <TreeConnector variant="down" />
                          <TreeLevel columns={Math.min(activeExtraItems.length, 3)}>
                            {activeExtraItems.map((item) => (
                              <TreeNode
                                key={item.id}
                                variant="leaf"
                                title={item.title}
                                subtitle={appendCostToSubtitle(
                                  item.description,
                                  item.estimated_cost,
                                  passengers
                                )}
                                selected={selectedExtraIds[activeExtraCategory] === item.id}
                                onClick={() => void pickHotelExtra(activeExtraCategory, item.id)}
                                disabled={loading}
                              />
                            ))}
                          </TreeLevel>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </TreeBranch>

                <TreeBranch>
                  <TreeConnector variant="down" />
                  <TreeNode
                    title="Транспорт по городу"
                    subtitle={
                      cityTransport?.categories.length
                        ? `${cityTransport.categories.length} категории`
                        : 'Нет данных для города'
                    }
                    active={cityTransportPhase === 'options'}
                    selected={Object.keys(selectedCityTransportIds).length > 0}
                    onClick={toggleCityTransportBranch}
                    disabled={loading || !cityTransport?.categories.length}
                  />

                  {cityTransportPhase === 'options' && cityTransport ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {cityTransport.categories.map((category) => (
                          <TreeNode
                            key={category.category}
                            variant="leaf"
                            title={category.title}
                            subtitle={
                              selectedCityTransportIds[category.category]
                                ? 'Выбрано'
                                : `${category.items.length} вариантов`
                            }
                            active={activeCityTransportCategory === category.category}
                            selected={Boolean(selectedCityTransportIds[category.category])}
                            onClick={() => setActiveCityTransportCategory(category.category)}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                      {activeCityTransportItems.length > 0 ? (
                        <>
                          <TreeConnector variant="down" />
                          <TreeLevel columns={Math.min(activeCityTransportItems.length, 3)}>
                            {activeCityTransportItems.map((item) => (
                              <TreeNode
                                key={item.id}
                                variant="leaf"
                                title={item.title}
                                subtitle={appendCostToSubtitle(
                                  item.description,
                                  item.estimated_cost,
                                  passengers
                                )}
                                selected={selectedCityTransportIds[activeCityTransportCategory] === item.id}
                                onClick={() =>
                                  void pickCityTransport(activeCityTransportCategory, item.id)
                                }
                                disabled={loading}
                              />
                            ))}
                          </TreeLevel>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </TreeBranch>

                <TreeBranch>
                  <TreeConnector variant="down" />
                  <TreeNode
                    title="Программа по дням"
                    subtitle={dayPlan?.days.length ? `${dayPlan.days.length} дней` : 'Нет данных'}
                    active={dayPlanPhase !== 'idle'}
                    selected={Object.keys(selectedDayPlanIds).length > 0}
                    onClick={toggleDayPlanBranch}
                    disabled={loading || !dayPlan?.days.length}
                  />

                  {dayPlanPhase === 'days' && dayPlan ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {dayPlan.days.map((day) => (
                          <TreeNode
                            key={day.day_key}
                            variant="leaf"
                            title={day.title}
                            subtitle={`${day.date} · ${day.theme}`}
                            active={activeDayKey === day.day_key}
                            selected={Object.keys(selectedDayPlanIds).some((key) =>
                              key.startsWith(`${day.day_key}:`)
                            )}
                            onClick={() => {
                              setActiveDayKey(day.day_key)
                              setActiveDaySlot(day.slots[0]?.slot ?? '')
                              setDayPlanPhase('slots')
                            }}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                    </>
                  ) : null}

                  {dayPlanPhase === 'slots' && activeDay ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {activeDaySlots.map((slot) => (
                          <TreeNode
                            key={slot.slot}
                            variant="leaf"
                            title={slot.title}
                            subtitle={
                              selectedDayPlanIds[`${activeDay.day_key}:${slot.slot}`]
                                ? 'Выбрано'
                                : `${slot.items.length} вариантов`
                            }
                            active={activeDaySlot === slot.slot}
                            selected={Boolean(selectedDayPlanIds[`${activeDay.day_key}:${slot.slot}`])}
                            onClick={() => setActiveDaySlot(slot.slot)}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                      {activeDaySlotItems.length > 0 ? (
                        <>
                          <TreeConnector variant="down" />
                          <TreeLevel columns={Math.min(activeDaySlotItems.length, 3)}>
                            {activeDaySlotItems.map((item) => (
                              <TreeNode
                                key={item.id}
                                variant="leaf"
                                title={item.title}
                                subtitle={appendCostToSubtitle(
                                  item.description,
                                  item.estimated_cost,
                                  passengers
                                )}
                                selected={
                                  selectedDayPlanIds[`${activeDay.day_key}:${activeDaySlot}`] === item.id
                                }
                                onClick={() =>
                                  void pickDayPlanItem(activeDay.day_key, activeDaySlot, item.id)
                                }
                                disabled={loading}
                              />
                            ))}
                          </TreeLevel>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </TreeBranch>

                <TreeBranch>
                  <TreeConnector variant="down" />
                  <TreeNode
                    title={transportNodeTitle}
                    subtitle={transportNodeSubtitle}
                    active={transportPhase === 'flights' && !selectedTransportId}
                    selected={Boolean(selectedTransportId)}
                    onClick={toggleTransportBranch}
                    disabled={loading}
                  />

                  {transportPhase === 'flights' ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {transport.slice(0, 6).map((item) => (
                          <TreeNode
                            key={item.itinerary_id}
                            variant="leaf"
                            title={item.outbound.title.replace('Авиаперелет ', '')}
                            subtitle={`${formatCatalogPerPersonCost(
                              roundMoney(item.total_price / Math.max(1, passengers)),
                              passengers
                            )} · ${formatDuration(item.total_duration_min)}`}
                            selected={selectedTransportId === item.itinerary_id}
                            onClick={() => void pickTransport(item.itinerary_id)}
                            onDetailsClick={
                              selectedTransportId === item.itinerary_id
                                ? () => setDetailsItinerary(item)
                                : undefined
                            }
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                    </>
                  ) : null}

                  {transportPhase === 'extras' && transportExtras ? (
                    <>
                      <TreeConnector variant="down" />
                      <TreeLevel>
                        {transportExtras.categories.map((category) => (
                          <TreeNode
                            key={category.category}
                            variant="leaf"
                            title={category.title}
                            subtitle={
                              selectedTransportExtraIds[category.category]
                                ? 'Выбрано'
                                : `${category.items.length} вариантов`
                            }
                            active={activeTransportExtraCategory === category.category}
                            selected={Boolean(selectedTransportExtraIds[category.category])}
                            onClick={() => setActiveTransportExtraCategory(category.category)}
                            disabled={loading}
                          />
                        ))}
                      </TreeLevel>
                      {activeTransportExtraItems.length > 0 ? (
                        <>
                          <TreeConnector variant="down" />
                          <TreeLevel columns={Math.min(activeTransportExtraItems.length, 3)}>
                            {activeTransportExtraItems.map((item) => (
                              <TreeNode
                                key={item.id}
                                variant="leaf"
                                title={item.title}
                                subtitle={appendCostToSubtitle(
                                  item.description,
                                  item.estimated_cost,
                                  passengers
                                )}
                                selected={
                                  selectedTransportExtraIds[activeTransportExtraCategory] === item.id
                                }
                                onClick={() =>
                                  void pickTransportExtra(activeTransportExtraCategory, item.id)
                                }
                                disabled={loading}
                              />
                            ))}
                          </TreeLevel>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </TreeBranch>
              </TreeLevel>
            </TripTree>
          )}
        </main>

        <AppFooter />

        {selectedDestination ? (
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
        ) : null}

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