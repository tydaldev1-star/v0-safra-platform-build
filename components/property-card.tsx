"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, MapPin, Bed, Users } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Badge } from "@/components/ui/badge"

export interface Property {
  id: string
  title: string
  location: string
  wilaya: string
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
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { t } = useI18n()
  const [wishlisted, setWishlisted] = useState(false)

  return (
    <Link href={`/listing/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setWishlisted(!wishlisted)
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                wishlisted ? "fill-red-500 text-red-500" : "text-foreground/60"
              }`}
            />
          </button>
          {property.isNew && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-2.5 shadow-sm">
              Nouveau
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title + rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-xs font-bold text-foreground">{property.rating}</span>
              <span className="text-xs text-muted-foreground">({property.reviewCount})</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            <span className="text-xs truncate">
              {property.location}, {property.wilaya}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 pb-3 border-b border-border">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms} ch.
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {property.guests} {t("guests")}
            </span>
            <span className="text-xs bg-secondary rounded-md px-2 py-0.5">{property.type}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-foreground text-base">
                {property.price.toLocaleString()} DA
              </span>
              <span className="text-muted-foreground text-xs">{t("listing_per_night")}</span>
            </div>
            <Button_reserve />
          </div>
        </div>
      </div>
    </Link>
  )
}

function Button_reserve() {
  return (
    <span className="text-xs font-semibold text-primary border border-primary/25 rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
      Réserver
    </span>
  )
}
