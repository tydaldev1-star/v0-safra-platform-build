"use client"

import { useState, useEffect, useRef } from "react"
import type { PropertyWithCoords } from "@/lib/mock-data"
import { Locate, Loader2, Navigation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import Image from "next/image"

interface MapViewProps {
  properties: PropertyWithCoords[]
  activeId?: string | null
  onMarkerClick?: (id: string) => void
  userPosition?: { lat: number; lng: number } | null
  onLocate?: () => void
  locating?: boolean
}

// Open Google Maps with directions to property
export function openGoogleMapsDirections(lat: number, lng: number, label?: string) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  window.open(url, "_blank")
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
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const userMarkerRef = useRef<any>(null)
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithCoords | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default
      
      // Import Leaflet CSS
      await import("leaflet/dist/leaflet.css")

      // Algeria center coordinates
      const algeriaCenter = { lat: 28.0339, lng: 1.6596 }

      // Create map centered on Algeria
      const map = L.map(mapRef.current!, {
        center: [algeriaCenter.lat, algeriaCenter.lng],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
        minZoom: 4,
        maxZoom: 18,
      })

      // Add OpenStreetMap tile layer (clean Carto style)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map)

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map)

      leafletMapRef.current = map

      // Fit bounds to show all properties in Algeria
      if (properties.length > 0) {
        const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]))
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 })
      }

      setMapReady(true)
    }

    initMap()

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // Add/update markers when properties or activeId changes
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return

    const addMarkers = async () => {
      const L = (await import("leaflet")).default

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current.clear()

      // Add markers for each property
      properties.forEach((p) => {
        const isActive = p.id === activeId || p.id === selectedProperty?.id

        // Create custom icon using divIcon
        const icon = L.divIcon({
          className: "custom-price-marker",
          html: `
            <div class="price-pill ${isActive ? "active" : ""}">
              <span>${(p.price / 1000).toFixed(1)}k DA</span>
              <div class="price-pill-arrow ${isActive ? "active" : ""}"></div>
            </div>
          `,
          iconSize: [80, 40],
          iconAnchor: [40, 40],
        })

        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(leafletMapRef.current!)
          .on("click", () => {
            setSelectedProperty(p)
            onMarkerClick?.(p.id)
          })

        markersRef.current.set(p.id, marker)
      })
    }

    addMarkers()
  }, [properties, activeId, selectedProperty?.id, mapReady, onMarkerClick])

  // Update user position marker
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return

    const updateUserMarker = async () => {
      const L = (await import("leaflet")).default

      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }

      // Add new user marker if position exists
      if (userPosition) {
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `
            <div class="user-dot">
              <div class="user-dot-ping"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], { icon: userIcon })
          .addTo(leafletMapRef.current!)

        // Fly to user position
        leafletMapRef.current.flyTo([userPosition.lat, userPosition.lng], 10, {
          duration: 1.5,
        })
      }
    }

    updateUserMarker()
  }, [userPosition, mapReady])

  // When activeId changes from parent, fly to that property
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady || !activeId) return

    const p = properties.find(pr => pr.id === activeId)
    if (p) {
      setSelectedProperty(p)
      leafletMapRef.current.flyTo([p.lat, p.lng], 10, { duration: 0.8 })
    }
  }, [activeId, properties, mapReady])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-secondary">
      {/* Leaflet Map Container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Custom Marker Styles */}
      <style jsx global>{`
        .custom-price-marker {
          background: transparent;
          border: none;
        }
        .price-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          background: var(--primary);
          color: white;
          font-size: 11px;
          font-weight: 700;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .price-pill:hover {
          transform: scale(1.08);
        }
        .price-pill.active {
          background: var(--accent);
          transform: scale(1.1);
          z-index: 100;
        }
        .price-pill-arrow {
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid var(--primary);
        }
        .price-pill-arrow.active {
          border-top-color: var(--accent);
        }
        .user-location-marker {
          background: transparent;
          border: none;
        }
        .user-dot {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          position: relative;
        }
        .user-dot-ping {
          position: absolute;
          inset: -4px;
          background: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .leaflet-control-zoom a {
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          border-radius: 8px !important;
          background: white !important;
          color: var(--foreground) !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:first-child {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom a:last-child {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>

      {/* Property Info Card (when selected) */}
      {selectedProperty && (
        <div 
          className={`
            absolute bg-white rounded-xl shadow-xl border border-border z-[1000] 
            animate-in slide-in-from-bottom-4 duration-200
            ${isMobile 
              ? "bottom-16 left-2 right-2 p-3" 
              : "bottom-16 left-1/2 -translate-x-1/2 w-[320px] p-3"
            }
          `}
        >
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full shadow-md flex items-center justify-center hover:bg-foreground/80 transition-colors"
            onClick={() => setSelectedProperty(null)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex gap-3">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
              <Image
                src={selectedProperty.image}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-tight">
                  {selectedProperty.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {selectedProperty.location}, {selectedProperty.wilaya}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="font-bold text-primary text-sm sm:text-base">
                  {selectedProperty.price.toLocaleString()} DA
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-normal ml-1">/ nuit</span>
                </span>
                <Button
                  size="sm"
                  className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-[10px] sm:text-xs"
                  onClick={() => openGoogleMapsDirections(selectedProperty.lat, selectedProperty.lng, selectedProperty.title)}
                >
                  <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Itinéraire</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locate Me Button */}
      {onLocate && (
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-[1000]">
          <Button
            size="sm"
            onClick={onLocate}
            disabled={locating}
            variant="outline"
            className="gap-1.5 sm:gap-2 bg-white text-foreground border-border hover:bg-secondary shadow-lg rounded-xl h-8 sm:h-9 px-2.5 sm:px-3"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
            ) : (
              <Locate className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            )}
            <span className="text-[10px] sm:text-xs font-semibold">{t("map_locate_me")}</span>
          </Button>
        </div>
      )}

      {/* Property Count Badge */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-md border border-border">
          <span className="text-xs sm:text-sm font-bold text-foreground">{properties.length}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">{t("stats_properties")}</span>
        </div>
      </div>

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-secondary flex items-center justify-center z-[500]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
