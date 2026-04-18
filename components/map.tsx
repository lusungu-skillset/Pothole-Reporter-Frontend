"use client"

import { useEffect, useRef, useState } from "react"

type LatLng = {
  lat: number
  lng: number
}

type LeafletModule = typeof import("leaflet")
type LeafletMap = ReturnType<LeafletModule["map"]>
type LeafletMarker = ReturnType<LeafletModule["marker"]>
type LeafletClickEvent = import("leaflet").LeafletMouseEvent

let leafletModulePromise: Promise<LeafletModule> | null = null
let defaultLeafletIconConfigured = false

function loadLeaflet() {
  if (!leafletModulePromise) {
    leafletModulePromise = import("leaflet")
  }

  return leafletModulePromise
}

function configureDefaultIcon(L: LeafletModule) {
  if (defaultLeafletIconConfigured) return

  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  })

  defaultLeafletIconConfigured = true
}

function getPopupContent(position: LatLng) {
  return `<strong>New report location</strong><br />Lat: ${position.lat.toFixed(4)}<br />Lng: ${position.lng.toFixed(4)}`
}

export default function Map({ onSelect }: { onSelect?: (pos: LatLng) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const onSelectRef = useRef(onSelect)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return

    let disposed = false

    loadLeaflet()
      .then((L) => {
        if (disposed || !containerRef.current) return

        configureDefaultIcon(L)

        const map = L.map(containerRef.current, {
          center: [-13.9833, 33.7833],
          zoom: 12,
          preferCanvas: true,
        })

        mapRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          updateWhenIdle: true,
          keepBuffer: 2,
        }).addTo(map)

        map.on("click", (event: LeafletClickEvent) => {
          const nextPos = {
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          }

          if (!markerRef.current) {
            markerRef.current = L.marker([nextPos.lat, nextPos.lng]).addTo(map)
            markerRef.current.bindPopup(getPopupContent(nextPos))
          } else {
            markerRef.current.setLatLng([nextPos.lat, nextPos.lng])
            markerRef.current.setPopupContent(getPopupContent(nextPos))
          }

          markerRef.current.openPopup()
          onSelectRef.current?.(nextPos)
        })

        window.requestAnimationFrame(() => {
          if (!disposed) {
            map.invalidateSize()
            setIsReady(true)
          }
        })
      })
      .catch((error) => {
        console.error("Error loading Leaflet:", error)
      })

    return () => {
      disposed = true

      if (mapRef.current) {
        mapRef.current.off()
        mapRef.current.remove()
        mapRef.current = null
      }

      markerRef.current = null
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px]">
      <div ref={containerRef} className="h-full w-full" />
      {!isReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      ) : null}
    </div>
  )
}
