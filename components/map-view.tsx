"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { PropertyWithCoords } from "@/lib/mock-data"
import { Locate, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

interface MapViewProps {
  properties: PropertyWithCoords[]
  activeId?: string | null
  onMarkerClick?: (id: string) => void
  userPosition?: { lat: number; lng: number } | null
  onLocate?: () => void
  locating?: boolean
}

export function MapView({
  properties,
  activeId,
  onMarkerClick,
  userPosition,
  onLocate,
  locating,
}: MapViewProps) {
  const { t } = useI18n()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const userMarkerRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const LRef = useRef<any>(null)

  // Init Leaflet map on client only
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let destroyed = false

    async function initMap() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")
      if (destroyed || !mapRef.current) return

      LRef.current = L

      const map = L.map(mapRef.current, {
        center: [28.0, 2.5],
        zoom: 5,
        zoomControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      L.control.zoom({ position: "topright" }).addTo(map)

      mapInstanceRef.current = map
      if (!destroyed) setMapReady(true)
    }

    initMap()

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Helper to create price-pill marker icon
  const createMarkerIcon = useCallback((L: any, price: number, isActive: boolean) => {
    const html = `
      <div style="
        background:${isActive ? "#F4872A" : "#2D4A8A"};
        color:white;
        border:2.5px solid white;
        border-radius:20px;
        padding:4px 10px;
        font-size:12px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 2px 12px rgba(0,0,0,0.25);
        cursor:pointer;
        transform:${isActive ? "scale(1.15)" : "scale(1)"};
        transition:transform 0.15s;
      ">${price.toLocaleString()} DA</div>`
    return L.divIcon({ html, className: "", iconAnchor: [40, 16] })
  }, [])

  // Render / update property markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !LRef.current) return
    const L = LRef.current
    const map = mapInstanceRef.current

    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    properties.forEach((p) => {
      const isActive = p.id === activeId
      const icon = createMarkerIcon(L, p.price, isActive)

      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:190px;font-family:sans-serif;">
            <img src="${p.image}" style="width:100%;height:88px;object-fit:cover;border-radius:8px;margin-bottom:7px;" />
            <div style="font-weight:700;font-size:13px;margin-bottom:3px;color:#1a1a1a;line-height:1.3;">${p.title}</div>
            <div style="font-size:12px;color:#777;margin-bottom:6px;">
              <span style="display:inline-flex;align-items:center;gap:3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F4872A" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                ${p.location}, ${p.wilaya}
              </span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:700;color:#2D4A8A;font-size:14px;">${p.price.toLocaleString()} <span style="font-size:11px;color:#999;font-weight:400">DA / nuit</span></span>
              <span style="background:#F4872A;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:10px;">★ ${p.rating}</span>
            </div>
          </div>`,
          { maxWidth: 220, className: "safra-popup" }
        )

      marker.on("click", () => onMarkerClick?.(p.id))
      markersRef.current.set(p.id, marker)
    })
  }, [mapReady, properties, activeId, createMarkerIcon, onMarkerClick])

  // Fly to active marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !activeId) return
    const prop = properties.find((p) => p.id === activeId)
    if (prop) {
      mapInstanceRef.current.flyTo([prop.lat, prop.lng], 12, { duration: 1 })
      const marker = markersRef.current.get(activeId)
      if (marker) setTimeout(() => marker.openPopup(), 800)
    }
  }, [activeId, mapReady, properties])

  // User position marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !LRef.current) return
    const L = LRef.current
    const map = mapInstanceRef.current

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    if (userPosition) {
      const html = `
        <div style="position:relative;width:20px;height:20px;">
          <div style="
            position:absolute;inset:0;
            background:#3B82F6;
            border-radius:50%;
            border:3px solid white;
            box-shadow:0 0 0 4px rgba(59,130,246,0.3);
          "></div>
        </div>`
      const icon = L.divIcon({ html, className: "", iconAnchor: [10, 10] })
      userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], { icon })
        .addTo(map)
        .bindPopup(`<b style="font-size:13px;color:#1a1a1a;">${t("map_your_location")}</b>`)
      map.flyTo([userPosition.lat, userPosition.lng], 12, { duration: 1.5 })
    }
  }, [userPosition, mapReady, t])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-md">
      <div ref={mapRef} className="w-full h-full" />

      {onLocate && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button
            size="sm"
            onClick={onLocate}
            disabled={locating}
            variant="outline"
            className="gap-2 bg-white text-foreground border-border hover:bg-secondary shadow-md rounded-xl"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Locate className="h-4 w-4 text-primary" />
            )}
            <span className="text-xs font-semibold">{t("map_locate_me")}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
