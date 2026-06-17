import { useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type {
  AccommodationItem,
  CityTransportResponse,
  DestinationItem,
  HotelExtrasResponse,
} from '../types/trip'
import { formatCatalogPerPersonCost } from '../utils/cost'
import {
  detailCityCategoryCover,
  detailCityItemCover,
  detailHotelCategoryCover,
  detailHotelItemCover,
} from '../data/detailImageCatalog'
import { accommodationCover, destinationCoverImage } from '../data/imageCatalog'
import { DetailExtraPickerPanel } from './panels/DetailExtraPickerPanel'
import { FlowNodeSlot } from './tree/FlowNodeSlot'
import { StepCard } from './tree/StepCard'
import { TreeConnectorLines, type TreeEdge } from './tree/TreeConnectorLines'
import {
  computeDetailFlowLayout,
  detailCanvasMinHeight,
  detailCanvasMinWidth,
  detailNodeKey,
  parseDetailNodeKey,
} from './tree/detailFlowLayout'
import { MOBILE_FLOW_MEDIA } from './tree/tripFlowLayout'
import type { FavoriteItemType } from '../types/favorites'
import { buildCatalogFavoriteKey } from '../types/favorites'

type PanelKey = string | null

export type TripDetailFlowTreeProps = {
  destination: DestinationItem
  hotel: AccommodationItem | undefined
  passengers: number
  loading: boolean
  hotelExtras: HotelExtrasResponse | null
  cityTransport: CityTransportResponse | null
  selectedHotelExtraIds: Record<string, string>
  selectedCityTransportIds: Record<string, string>
  onPickHotelExtra: (category: string, itemId: string) => Promise<void>
  onPickCityTransport: (category: string, itemId: string) => Promise<void>
  isFavorite: (itemType: FavoriteItemType, itemKey: string) => boolean
  onToggleFavorite: (
    itemType: Extract<FavoriteItemType, 'hotel_extra' | 'city_transport'>,
    itemKey: string,
    meta: { title: string; subtitle?: string; country?: string; description?: string; imageUrls?: string[] }
  ) => void
}

export function TripDetailFlowTree({
  destination,
  hotel,
  passengers,
  loading,
  hotelExtras,
  cityTransport,
  selectedHotelExtraIds,
  selectedCityTransportIds,
  onPickHotelExtra,
  onPickCityTransport,
  isFavorite,
  onToggleFavorite,
}: TripDetailFlowTreeProps) {
  const [panel, setPanel] = useState<PanelKey>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const isStacked = useMediaQuery(MOBILE_FLOW_MEDIA)

  const hotelCategories = hotelExtras?.categories ?? []
  const cityCategories = cityTransport?.categories ?? []

  const hotelCategoryIds = hotelCategories.map((c) => c.category)
  const cityCategoryIds = cityCategories.map((c) => c.category)

  const layout = useMemo(
    () =>
      computeDetailFlowLayout({
        hotelCategories: hotelCategoryIds,
        cityCategories: cityCategoryIds,
      }),
    [hotelCategoryIds, cityCategoryIds]
  )

  const minWidth = detailCanvasMinWidth(hotelCategoryIds, cityCategoryIds)
  const minHeight = detailCanvasMinHeight(hotelCategoryIds, cityCategoryIds)

  const activePanel = useMemo(() => {
    if (!panel) return null
    const parsed = parseDetailNodeKey(panel)
    if (!parsed) return null
    if (parsed.kind === 'hotel-extra') {
      const category = hotelCategories.find((c) => c.category === parsed.category)
      if (!category) return null
      return {
        kind: parsed.kind,
        category: parsed.category,
        title: category.title,
        items: category.items,
        selectedId: selectedHotelExtraIds[parsed.category],
        imageUrlForItem: (item: { id: string }) =>
          detailHotelItemCover(item.id, parsed.category, hotel?.id ?? '', destination),
        onSelect: (itemId: string) => onPickHotelExtra(parsed.category, itemId),
      }
    }
    const category = cityCategories.find((c) => c.category === parsed.category)
    if (!category) return null
    return {
      kind: parsed.kind,
      category: parsed.category,
      title: category.title,
      items: category.items,
      selectedId: selectedCityTransportIds[parsed.category],
      imageUrlForItem: (item: { id: string }) =>
        detailCityItemCover(item.id, parsed.category, destination),
      onSelect: (itemId: string) => onPickCityTransport(parsed.category, itemId),
    }
  }, [
    panel,
    hotelCategories,
    cityCategories,
    selectedHotelExtraIds,
    selectedCityTransportIds,
    hotel?.id,
    destination,
    onPickHotelExtra,
    onPickCityTransport,
  ])

  const edges = useMemo<TreeEdge[]>(() => {
    if (isStacked) return []
    const list: TreeEdge[] = []

    if (layout.hotel) {
      list.push({
        from: { nodeId: 'dest', side: 'bottom' },
        to: { nodeId: 'hotel', side: 'top' },
      })
    }

    hotelCategoryIds.forEach((category) => {
      const nodeId = detailNodeKey('hotel-extra', category)
      if (layout[nodeId] && layout.hotel) {
        list.push({
          from: { nodeId: 'hotel', side: 'bottom' },
          to: { nodeId, side: 'top' },
        })
      }
    })

    cityCategoryIds.forEach((category) => {
      const nodeId = detailNodeKey('city-transport', category)
      if (layout[nodeId]) {
        list.push({
          from: { nodeId: 'dest', side: 'bottom' },
          to: { nodeId, side: 'top' },
        })
      }
    })

    return list
  }, [isStacked, layout, hotelCategoryIds, cityCategoryIds])

  function subtitleForHotelCategory(category: string, title: string) {
    const selectedId = selectedHotelExtraIds[category]
    if (!selectedId) return 'Выбрать вариант'
    const item = hotelCategories.find((c) => c.category === category)?.items.find((i) => i.id === selectedId)
    return item
      ? `${item.title} · ${formatCatalogPerPersonCost(item.estimated_cost, passengers)}`
      : title
  }

  function subtitleForCityCategory(category: string, title: string) {
    const selectedId = selectedCityTransportIds[category]
    if (!selectedId) return 'Выбрать вариант'
    const item = cityCategories.find((c) => c.category === category)?.items.find((i) => i.id === selectedId)
    return item
      ? `${item.title} · ${formatCatalogPerPersonCost(item.estimated_cost, passengers)}`
      : title
  }

  return (
    <div className={`tripFlow tripFlow--detail${isStacked ? ' tripFlow--stacked' : ''}`}>
      <div
        ref={flowRef}
        className={`tripFlow__canvas${isStacked ? ' tripFlow__canvas--stacked' : ''}`}
        style={isStacked ? undefined : { minWidth: `${minWidth}px`, minHeight: `${minHeight}px` }}
      >
        {!isStacked ? <TreeConnectorLines containerRef={flowRef} edges={edges} /> : null}

        {layout.dest ? (
          <FlowNodeSlot position={layout.dest}>
            <StepCard
              nodeId="dest"
              variant="flow"
              title={destination.title}
              subtitle="Направление"
              visible
              selected
              disabled
              imageUrl={destinationCoverImage(destination)}
            />
          </FlowNodeSlot>
        ) : null}

        {layout.hotel && hotel ? (
          <FlowNodeSlot position={layout.hotel}>
            <StepCard
              nodeId="hotel"
              variant="flow"
              title={hotel.title}
              subtitle={`${hotel.stars}★ · ваш отель`}
              visible
              selected
              disabled
              delayMs={80}
              imageUrl={accommodationCover(hotel)}
            />
          </FlowNodeSlot>
        ) : null}

        {hotelCategories.map((category, index) => {
          const nodeId = detailNodeKey('hotel-extra', category.category)
          const position = layout[nodeId]
          if (!position) return null
          return (
            <FlowNodeSlot key={nodeId} position={position}>
              <StepCard
                nodeId={nodeId}
                variant="flow"
                title={category.title}
                subtitle={subtitleForHotelCategory(category.category, category.title)}
                visible
                delayMs={120 + index * 60}
                selected={Boolean(selectedHotelExtraIds[category.category])}
                onClick={() => setPanel(nodeId)}
                disabled={loading || category.items.length === 0}
                imageUrl={
                  selectedHotelExtraIds[category.category]
                    ? detailHotelItemCover(
                        selectedHotelExtraIds[category.category],
                        category.category,
                        hotel?.id ?? '',
                        destination
                      )
                    : detailHotelCategoryCover(category.category, hotel?.id ?? '', destination)
                }
              />
            </FlowNodeSlot>
          )
        })}

        {cityCategories.map((category, index) => {
          const nodeId = detailNodeKey('city-transport', category.category)
          const position = layout[nodeId]
          if (!position) return null
          return (
            <FlowNodeSlot key={nodeId} position={position}>
              <StepCard
                nodeId={nodeId}
                variant="flow"
                title={category.title}
                subtitle={subtitleForCityCategory(category.category, category.title)}
                visible
                delayMs={160 + index * 60}
                selected={Boolean(selectedCityTransportIds[category.category])}
                onClick={() => setPanel(nodeId)}
                disabled={loading || category.items.length === 0}
                imageUrl={
                  selectedCityTransportIds[category.category]
                    ? detailCityItemCover(
                        selectedCityTransportIds[category.category],
                        category.category,
                        destination
                      )
                    : detailCityCategoryCover(category.category, destination)
                }
              />
            </FlowNodeSlot>
          )
        })}
      </div>

      {activePanel ? (
        <DetailExtraPickerPanel
          open={Boolean(panel)}
          title={activePanel.title}
          items={activePanel.items}
          selectedId={activePanel.selectedId}
          passengers={passengers}
          entityType={activePanel.kind === 'hotel-extra' ? 'hotel_extra' : 'city_transport'}
          category={activePanel.category}
          imageUrlForItem={activePanel.imageUrlForItem}
          isFavorite={(itemId) =>
            isFavorite(
              activePanel.kind === 'hotel-extra' ? 'hotel_extra' : 'city_transport',
              buildCatalogFavoriteKey(activePanel.category, itemId)
            )
          }
          onToggleFavorite={(item, imageUrl) =>
            onToggleFavorite(
              activePanel.kind === 'hotel-extra' ? 'hotel_extra' : 'city_transport',
              buildCatalogFavoriteKey(activePanel.category, item.id),
              {
                title: item.title,
                subtitle: `${activePanel.title} · ${formatCatalogPerPersonCost(item.estimated_cost, passengers)}`,
                country: destination.country,
                description: item.description,
                imageUrls: imageUrl ? [imageUrl] : [],
              }
            )
          }
          onClose={() => setPanel(null)}
          onSelect={(id) => {
            void activePanel.onSelect(id).then(() => setPanel(null))
          }}
        />
      ) : null}
    </div>
  )
}
