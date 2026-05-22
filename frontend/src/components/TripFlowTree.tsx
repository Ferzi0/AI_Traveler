import { useMemo, useState } from 'react'
import type {
  AccommodationItem,
  AccommodationSearchResponse,
  DestinationItem,
  RoomItem,
  TransportExtrasResponse,
  TransportItinerary,
} from '../types/trip'
import { formatCatalogPerPersonCost, roundMoney } from '../utils/cost'
import { GrowConnector } from './tree/GrowConnector'
import { StepCard } from './tree/StepCard'
import {
  FlightExplorerPanel,
  type FlightSearchFilters,
} from './panels/FlightExplorerPanel'
import {
  HotelExplorerPanel,
  type HotelSearchFilters,
} from './panels/HotelExplorerPanel'
import { RoomPickerPanel } from './panels/RoomPickerPanel'
import { ExtraPickerPanel } from './panels/ExtraPickerPanel'

type Panel = 'hotels' | 'rooms' | 'flights' | 'baggage' | 'refund' | null

export type TripFlowTreeProps = {
  destination: DestinationItem
  tripId: number
  passengers: number
  loading: boolean
  accommodations: AccommodationItem[]
  rooms: RoomItem[]
  transport: TransportItinerary[]
  transportExtras: TransportExtrasResponse | null
  selectedHotelId: string
  selectedRoomId: string
  selectedTransportId: string
  selectedTransportExtraIds: Record<string, string>
  onSearchHotels: (filters: HotelSearchFilters) => Promise<AccommodationSearchResponse>
  onPickHotel: (hotelId: string) => Promise<void>
  onSearchRooms: (sortBy: string) => Promise<RoomItem[]>
  onPickRoom: (roomId: string, accommodationId: string) => Promise<void>
  onSearchFlights: (filters: FlightSearchFilters) => Promise<TransportItinerary[]>
  onPickFlight: (itineraryId: string) => Promise<void>
  onPickTransportExtra: (category: string, itemId: string) => Promise<void>
  onShowFlightDetails?: (item: TransportItinerary) => void
}

export function TripFlowTree({
  destination,
  passengers,
  loading,
  accommodations,
  rooms,
  transport,
  transportExtras,
  selectedHotelId,
  selectedRoomId,
  selectedTransportId,
  selectedTransportExtraIds,
  onSearchHotels,
  onPickHotel,
  onSearchRooms,
  onPickRoom,
  onSearchFlights,
  onPickFlight,
  onPickTransportExtra,
  onShowFlightDetails,
}: TripFlowTreeProps) {
  const [panel, setPanel] = useState<Panel>(null)

  const selectedHotel = accommodations.find((h) => h.id === selectedHotelId)
  const selectedRoom = rooms.find((r) => r.room_id === selectedRoomId)
  const selectedFlight = transport.find((t) => t.itinerary_id === selectedTransportId)

  const baggageCategory = transportExtras?.categories.find((c) => c.category === 'baggage')
  const refundCategory = transportExtras?.categories.find((c) => c.category === 'refund_policy')

  const baggageItem = baggageCategory?.items.find(
    (i) => i.id === selectedTransportExtraIds.baggage
  )
  const refundItem = refundCategory?.items.find(
    (i) => i.id === selectedTransportExtraIds.refund_policy
  )

  const hasDestination = Boolean(destination)
  const showBranches = hasDestination
  const showRoomsBranch = Boolean(selectedHotelId)
  const showFlightExtras = Boolean(selectedTransportId && transportExtras)

  const hotelsSubtitle = selectedHotel
    ? `${selectedHotel.title} · $${selectedHotel.price}`
    : 'Подобрать отель'
  const roomsSubtitle = selectedRoom
    ? `${selectedRoom.room_name} · $${selectedRoom.price_total}`
    : selectedHotel
      ? 'Выберите номер'
      : 'Сначала отель'
  const flightsSubtitle = selectedFlight
    ? `${selectedFlight.outbound.title.replace('Авиаперелет ', '')} · ${formatCatalogPerPersonCost(
        roundMoney(selectedFlight.total_price / Math.max(1, passengers)),
        passengers
      )}`
    : 'Подобрать рейс'

  const baggageSubtitle = baggageItem ? baggageItem.title : 'Выбрать багаж'
  const refundSubtitle = refundItem ? refundItem.title : 'Условия возврата'

  const extraPanels = useMemo(
    () => ({
      baggage: baggageCategory?.items ?? [],
      refund: refundCategory?.items ?? [],
    }),
    [baggageCategory, refundCategory]
  )

  async function handlePickHotel(id: string) {
    await onPickHotel(id)
    setPanel(null)
  }

  async function handlePickRoom(roomId: string, accId: string) {
    await onPickRoom(roomId, accId)
    setPanel(null)
  }

  async function handlePickFlight(id: string) {
    await onPickFlight(id)
    setPanel(null)
  }

  return (
    <div className="tripFlow">
      <div className="tripFlow__column">
        <StepCard
          title={destination.title}
          subtitle={destination.country}
          visible={hasDestination}
          selected
          disabled
        />

        <GrowConnector visible={showBranches} variant="down" delayMs={120} />

        {showBranches ? (
          <div className="tripFlow__split">
            <GrowConnector visible={showBranches} variant="branchLeft" delayMs={200} />
            <GrowConnector visible={showBranches} variant="branchRight" delayMs={200} />

            <div className="tripFlow__branches">
              <div className="tripFlow__branch">
                <StepCard
                  title={selectedHotel ? 'Отель' : 'Отели'}
                  subtitle={hotelsSubtitle}
                  visible={showBranches}
                  delayMs={280}
                  selected={Boolean(selectedHotelId)}
                  onClick={() => setPanel('hotels')}
                  disabled={loading}
                  imageUrl={selectedHotel?.image_url}
                />

                <GrowConnector visible={showRoomsBranch} variant="down" delayMs={400} />

                {showRoomsBranch ? (
                  <StepCard
                    title="Номера"
                    subtitle={roomsSubtitle}
                    visible={showRoomsBranch}
                    delayMs={480}
                    selected={Boolean(selectedRoomId)}
                    onClick={() => selectedHotelId && setPanel('rooms')}
                    disabled={loading || !selectedHotelId}
                  />
                ) : null}
              </div>

              <div className="tripFlow__branch">
                <StepCard
                  title={selectedFlight ? 'Рейс' : 'Рейсы'}
                  subtitle={flightsSubtitle}
                  visible={showBranches}
                  delayMs={320}
                  selected={Boolean(selectedTransportId)}
                  onClick={() => setPanel('flights')}
                  disabled={loading}
                />

                <GrowConnector visible={showFlightExtras} variant="down" delayMs={520} />

                {showFlightExtras ? (
                  <>
                    <StepCard
                      title="Багаж"
                      subtitle={baggageSubtitle}
                      visible={showFlightExtras}
                      delayMs={600}
                      selected={Boolean(selectedTransportExtraIds.baggage)}
                      onClick={() => setPanel('baggage')}
                      disabled={loading}
                    />
                    <GrowConnector visible={showFlightExtras} variant="down" delayMs={680} />
                    <StepCard
                      title="Условия возврата"
                      subtitle={refundSubtitle}
                      visible={showFlightExtras}
                      delayMs={760}
                      selected={Boolean(selectedTransportExtraIds.refund_policy)}
                      onClick={() => setPanel('refund')}
                      disabled={loading}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <HotelExplorerPanel
        open={panel === 'hotels'}
        onClose={() => setPanel(null)}
        onSearch={onSearchHotels}
        onSelect={(id) => void handlePickHotel(id)}
        loading={loading}
      />

      <RoomPickerPanel
        open={panel === 'rooms'}
        hotelTitle={selectedHotel?.title ?? 'Отель'}
        onClose={() => setPanel(null)}
        onSearch={onSearchRooms}
        onSelect={(roomId, accId) => void handlePickRoom(roomId, accId)}
        loading={loading}
      />

      <FlightExplorerPanel
        open={panel === 'flights'}
        onClose={() => setPanel(null)}
        passengers={passengers}
        onSearch={onSearchFlights}
        onSelect={(id) => void handlePickFlight(id)}
        onDetails={onShowFlightDetails}
        loading={loading}
      />

      <ExtraPickerPanel
        open={panel === 'baggage'}
        title="Багаж"
        items={extraPanels.baggage}
        selectedId={selectedTransportExtraIds.baggage}
        passengers={passengers}
        onClose={() => setPanel(null)}
        onSelect={(id) => {
          void onPickTransportExtra('baggage', id)
          setPanel(null)
        }}
      />

      <ExtraPickerPanel
        open={panel === 'refund'}
        title="Условия возврата"
        items={extraPanels.refund}
        selectedId={selectedTransportExtraIds.refund_policy}
        passengers={passengers}
        onClose={() => setPanel(null)}
        onSelect={(id) => {
          void onPickTransportExtra('refund_policy', id)
          setPanel(null)
        }}
      />
    </div>
  )
}
