"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, MapPin, Bed, Users, Navigation } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Badge } from "@/components/ui/badge"

export interface Property {
  id: string
  title: string
  location: string
  wilaya: string
  address?: string
  lat?: number
  lng?: number
  price: number
  rating: number
  reviewCount: number
  image: string
  type: string
  bedrooms: number
  guests: number
  amenities: string[]
  isNew?: boolean
}

interface PropertyCardProps {
  property: Property
  showLocationButton?: boolean
}

function openGoogleMapsDirections(lat: number, lng: number) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")
}

export function PropertyCard({ property, showLocationButton = true }: PropertyCardProps) {
  const { t } = useI18n()
  const [wishlisted, setWishlisted] = useState(false)

  return (
    <Link href={`/listing/${property.id}`} className="group block focus:outline-none">
      <div className="card-premium bg-card rounded-3xl overflow-hidden">
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={property.image || "/images/property-1.jpg"}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
            className="absolute top-3.5 right-3.5 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
            aria-label="Ajouter aux favoris"
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${wishlisted ? "fill-red-500 text-red-500 scale-110" : "text-foreground/50"}`} />
          </button>

          {/* New badge */}
          {property.isNew && (
            <div className="absolute top-3.5 left-3.5">
              <span className="bg-white/95 backdrop-blur-md text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                Nouveau
              </span>
            </div>
          )}

          {/* Maps button */}
          {showLocationButton && property.lat && property.lng && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openGoogleMapsDirections(property.lat!, property.lng!) }}
              className="absolute bottom-3.5 left-3.5 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Voir sur Google Maps"
            >
              <Navigation className="h-3.5 w-3.5 text-primary" />
            </button>
          )}

          {/* Type pill */}
          <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              {property.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title + rating row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-[14px] leading-snug line-clamp-1 flex-1 tracking-[-0.01em]">
              {property.title}
            </h3>
            {property.rating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="text-[12px] font-semibold text-foreground">{Number(property.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <p className="text-[12px] text-muted-foreground mb-3 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{property.location}, {property.wilaya}</span>
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary rounded-full px-2.5 py-1">
              <Bed className="h-3 w-3" />{property.bedrooms} ch.
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary rounded-full px-2.5 py-1">
              <Users className="h-3 w-3" />{property.guests}
            </span>
            {property.reviewCount > 0 && (
              <span className="text-[11px] text-muted-foreground ml-auto">
                {property.reviewCount} avis
              </span>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-foreground tracking-tight">
                {Number(property.price).toLocaleString("fr-DZ")} DA
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">{t("listing_per_night")}</span>
            </div>
            <span className="text-[12px] font-semibold text-primary bg-primary/8 rounded-full px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer">
              Réserver
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
