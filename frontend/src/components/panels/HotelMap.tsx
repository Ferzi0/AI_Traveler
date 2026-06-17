import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { AccommodationItem } from '../../types/trip'
import { formatPrice } from '../../utils/flightDisplay'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

type Props = {
  center: { latitude: number; longitude: number }
  hotels: AccommodationItem[]
  activeId?: string
  onSelect: (id: string) => void
}

export function HotelMap({ center, hotels, activeId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      [center.latitude, center.longitude],
      12
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = null
    }
  }, [])

  useEffect(() => {
    mapRef.current?.setView([center.latitude, center.longitude], mapRef.current.getZoom())
  }, [center.latitude, center.longitude])

  useEffect(() => {
    const group = markersRef.current
    const map = mapRef.current
    if (!group || !map) return
    group.clearLayers()
    hotels.forEach((hotel) => {
      const marker = L.marker([hotel.latitude, hotel.longitude])
      marker.bindPopup(`<strong>${hotel.title}</strong><br/>${formatPrice(hotel.price, 'rub', true)}/ночь`)
      marker.on('click', () => onSelect(hotel.id))
      if (hotel.id === activeId) {
        marker.openPopup()
      }
      marker.addTo(group)
    })
    if (hotels.length > 0) {
      const bounds = L.latLngBounds(hotels.map((h) => [h.latitude, h.longitude] as [number, number]))
      map.fitBounds(bounds.pad(0.15), { maxZoom: 14 })
    }
  }, [hotels, activeId, onSelect])

  return <div ref={containerRef} className="hotelMap" />
}
