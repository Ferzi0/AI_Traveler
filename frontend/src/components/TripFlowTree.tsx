import { useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type {
  AccommodationItem,
  AccommodationSearchResponse,
  DestinationItem,
  RoomItem,
  TransportExtrasResponse,
  TransportItinerary,
} from '../types/trip'
import { formatPrice } from '../utils/flightDisplay'
import { FlowNodeSlot } from './tree/FlowNodeSlot'
import { StepCard } from './tree/StepCard'
import { TreeConnectorLines, type TreeEdge } from './tree/TreeConnectorLines'
import { canvasMinWidth, computeFlowLayout, MOBILE_FLOW_MEDIA } from './tree/tripFlowLayout'
import { accommodationCover, accommodationGallery, destinationCoverImage, roomCover } from '../data/imageCatalog'
import {
  FlightExplorerPanel,
  type FlightSearchFilters,
  type FlightSearchMeta,
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
  isFavorite: (itemType: 'city' | 'hotel', itemKey: string) => boolean
  onToggleFavorite: (
    itemType: 'city' | 'hotel',
    itemKey: string,
    meta: { title: string; subtitle?: string; country?: string; imageUrls?: string[] }
  ) => void
  onSearchHotels: (filters: HotelSearchFilters) => Promise<AccommodationSearchResponse>
  onPickHotel: (hotelId: string) => Promise<void>
  onSearchRooms: (sortBy: string) => Promise<RoomItem[]>
  onPickRoom: (roomId: string, accommodationId: string) => Promise<void>
  onSearchFlights: (
    filters: FlightSearchFilters
  ) => Promise<TransportItinerary[] | { items: TransportItinerary[]; search?: FlightSearchMeta }>
  onPickFlight: (itineraryId: string) => Promise<void>
  onPickTransportExtra: (category: string, itemId: string) => Promise<void>
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
  isFavorite,
  onToggleFavorite,
  onSearchHotels,
  onPickHotel,
  onSearchRooms,
  onPickRoom,
  onSearchFlights,
  onPickFlight,
  onPickTransportExtra,
}: TripFlowTreeProps) {
  const [panel, setPanel] = useState<Panel>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const isStacked = useMediaQuery(MOBILE_FLOW_MEDIA)

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

  const layout = useMemo(
    () =>
      computeFlowLayout({
        showBranches,
        showRooms: showRoomsBranch,
        showFlightExtras,
      }),
    [showBranches, showRoomsBranch, showFlightExtras]
  )

  const minWidth = canvasMinWidth({
    showRooms: showRoomsBranch,
    showFlightExtras,
  })

  const hotelsSubtitle = selectedHotel
    ? `${selectedHotel.title} · $${selectedHotel.price}`
    : 'Подобрать отель'
  const roomsSubtitle = selectedRoom
    ? `${selectedRoom.room_name} · $${selectedRoom.price_total}`
    : selectedHotel
      ? 'Выберите номер'
      : 'Сначала отель'
  const flightsSubtitle = selectedFlight
    ? `${selectedFlight.outbound.title.replace('Авиаперелет ', '')} · ${formatPrice(
        selectedFlight.details.price_per_passenger,
        'rub'
      )}/чел`
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

  const edges = useMemo<TreeEdge[]>(() => {
    if (isStacked) return []
    const list: TreeEdge[] = []
    if (showBranches) {
      list.push(
        { from: { nodeId: 'dest', side: 'bottom' }, to: { nodeId: 'hotels', side: 'top' } },
        { from: { nodeId: 'dest', side: 'bottom' }, to: { nodeId: 'flights', side: 'top' } }
      )
    }
    if (showRoomsBranch && layout.rooms) {
      list.push({
        from: { nodeId: 'hotels', side: 'right' },
        to: { nodeId: 'rooms', side: 'left' },
      })
    }
    if (showFlightExtras && layout.baggage) {
      list.push({
        from: { nodeId: 'flights', side: 'right' },
        to: { nodeId: 'baggage', side: 'left' },
      })
      if (layout.refund) {
        list.push({
          from: { nodeId: 'baggage', side: 'right' },
          to: { nodeId: 'refund', side: 'left' },
        })
      }
    }
    return list
  }, [isStacked, showBranches, showRoomsBranch, showFlightExtras, layout.rooms, layout.baggage, layout.refund])

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
    <div className={`tripFlow${isStacked ? ' tripFlow--stacked' : ''}`}>
      <div
        ref={flowRef}
        className={`tripFlow__canvas${isStacked ? ' tripFlow__canvas--stacked' : ''}`}
        style={
          isStacked
            ? undefined
            : { minWidth: `${minWidth}px`, minHeight: showBranches ? 300 : 200 }
        }
      >
        {!isStacked ? <TreeConnectorLines containerRef={flowRef} edges={edges} /> : null}

        {layout.dest ? (
          <FlowNodeSlot position={layout.dest}>
            <StepCard
              nodeId="dest"
              variant="flow"
              title={destination.title}
              subtitle="Выбрано направление"
              visible={hasDestination}
              selected
              disabled
              imageUrl={destinationCoverImage(destination)}
            />
          </FlowNodeSlot>
        ) : null}

        {layout.hotels ? (
          <FlowNodeSlot position={layout.hotels}>
            <StepCard
              nodeId="hotels"
              variant="flow"
              title={selectedHotel ? selectedHotel.title : 'Отели'}
              subtitle={hotelsSubtitle}
              visible={showBranches}
              delayMs={120}
              selected={Boolean(selectedHotelId)}
              onClick={() => setPanel('hotels')}
              disabled={loading}
              imageUrl={selectedHotel ? accommodationCover(selectedHotel) : undefined}
              favoriteActive={selectedHotel ? isFavorite('hotel', selectedHotel.id) : false}
              onFavoriteToggle={
                selectedHotel
                  ? () =>
                      onToggleFavorite('hotel', selectedHotel.id, {
                        title: selectedHotel.title,
                        subtitle: `${selectedHotel.stars}★ · $${selectedHotel.price}`,
                        country: destination.country,
                        imageUrls: accommodationGallery(selectedHotel),
                      })
                  : undefined
              }
            />
          </FlowNodeSlot>
        ) : null}

        {layout.rooms && showRoomsBranch ? (
          <FlowNodeSlot position={layout.rooms}>
            <StepCard
              nodeId="rooms"
              variant="flow"
              title={selectedRoom ? selectedRoom.room_name : 'Номера'}
              subtitle={roomsSubtitle}
              visible={showRoomsBranch}
              delayMs={200}
              selected={Boolean(selectedRoomId)}
              onClick={() => selectedHotelId && setPanel('rooms')}
              disabled={loading || !selectedHotelId}
              imageUrl={selectedRoom ? roomCover(selectedRoom) : undefined}
            />
          </FlowNodeSlot>
        ) : null}

        {layout.flights ? (
          <FlowNodeSlot position={layout.flights}>
            <StepCard
              nodeId="flights"
              variant="flow"
              title={selectedFlight ? 'Рейс' : 'Рейсы'}
              subtitle={flightsSubtitle}
              visible={showBranches}
              delayMs={160}
              selected={Boolean(selectedTransportId)}
              onClick={() => setPanel('flights')}
              disabled={loading}
            />
          </FlowNodeSlot>
        ) : null}

        {layout.baggage && showFlightExtras ? (
          <FlowNodeSlot position={layout.baggage}>
            <StepCard
              nodeId="baggage"
              variant="flow"
              title="Багаж"
              subtitle={baggageSubtitle}
              visible={showFlightExtras}
              delayMs={280}
              selected={Boolean(selectedTransportExtraIds.baggage)}
              onClick={() => setPanel('baggage')}
              disabled={loading}
            />
          </FlowNodeSlot>
        ) : null}

        {layout.refund && showFlightExtras ? (
          <FlowNodeSlot position={layout.refund}>
            <StepCard
              nodeId="refund"
              variant="flow"
              title="Условия возврата"
              subtitle={refundSubtitle}
              visible={showFlightExtras}
              delayMs={360}
              selected={Boolean(selectedTransportExtraIds.refund_policy)}
              onClick={() => setPanel('refund')}
              disabled={loading}
            />
          </FlowNodeSlot>
        ) : null}
      </div>

      <HotelExplorerPanel
        open={panel === 'hotels'}
        onClose={() => setPanel(null)}
        onSearch={onSearchHotels}
        onSelect={(id) => void handlePickHotel(id)}
        loading={loading}
        isFavorite={(id) => isFavorite('hotel', id)}
        onToggleFavorite={(hotel) =>
          onToggleFavorite('hotel', hotel.id, {
            title: hotel.title,
            subtitle: `${hotel.stars}★ · $${hotel.price}`,
            country: destination.country,
            imageUrls: accommodationGallery(hotel),
          })
        }
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
