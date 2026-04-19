"use client"

import { useState, useEffect } from "react"
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
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithCoords | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // When activeId changes from parent, update selected property
  useEffect(() => {
    if (activeId) {
      const p = properties.find(pr => pr.id === activeId)
      if (p) setSelectedProperty(p)
    }
  }, [activeId, properties])

  const handleMarkerClick = (p: PropertyWithCoords) => {
    setSelectedProperty(p)
    onMarkerClick?.(p.id)
  }

  // Calculate center based on properties
  const center = properties.length > 0
    ? {
        lat: properties.reduce((s, p) => s + p.lat, 0) / properties.length,
        lng: properties.reduce((s, p) => s + p.lng, 0) / properties.length
      }
    : { lat: 28.0, lng: 2.5 }

  // Build Google Maps Static API URL with markers (no API key needed for embed)
  // Using iframe embed with search query for the area
  const mapQuery = properties.length > 0 
    ? encodeURIComponent(`${properties[0].wilaya}, Algeria`)
    : "Algeria"

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-secondary">
      {/* Google Maps Embed - simple search-based embed (no API key) */}
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d500000!2d${center.lng}!3d${center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sdz!4v1700000000000!5m2!1sfr!2sdz`}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Safra Map"
      />

      {/* Property Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none p-4">
        <div className="relative w-full h-full">
          {properties.map((p) => {
            const isActive = p.id === activeId || p.id === selectedProperty?.id
            // Simple positioning relative to center (for visual demo)
            const offsetX = ((p.lng - center.lng) * 15) // Scale factor
            const offsetY = ((center.lat - p.lat) * 15)
            
            return (
              <button
                key={p.id}
                className={`
                  pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 
                  transition-all duration-200 cursor-pointer z-10
                  ${isActive ? "z-20 scale-110" : "hover:scale-105 hover:z-15"}
                `}
                style={{
                  left: `calc(50% + ${offsetX}%)`,
                  top: `calc(50% + ${offsetY}%)`,
                }}
                onClick={() => handleMarkerClick(p)}
              >
                <div
                  className={`
                    px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-white 
                    shadow-lg border-2 border-white whitespace-nowrap
                    ${isActive ? "bg-accent" : "bg-primary hover:bg-primary/90"}
                  `}
                >
                  {(p.price / 1000).toFixed(1)}k DA
                </div>
                {/* Triangle pointer */}
                <div
                  className={`
                    w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-t-[5px]
                    border-l-transparent border-r-transparent
                    ${isActive ? "border-t-accent" : "border-t-primary"}
                  `}
                />
              </button>
            )
          })}

          {/* User position marker */}
          {userPosition && (
            <div
              className="absolute w-4 h-4 z-30 pointer-events-none"
              style={{
                left: `calc(50% + ${(userPosition.lng - center.lng) * 15}%)`,
                top: `calc(50% + ${(center.lat - userPosition.lat) * 15}%)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-full h-full bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Info Card (when selected) */}
      {selectedProperty && (
        <div 
          className={`
            absolute bg-white rounded-xl shadow-xl border border-border z-30 
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
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20">
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
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-md border border-border">
          <span className="text-xs sm:text-sm font-bold text-foreground">{properties.length}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">{t("stats_properties")}</span>
        </div>
      </div>
    </div>
  )
}
