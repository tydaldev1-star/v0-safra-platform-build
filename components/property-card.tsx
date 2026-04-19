"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, MapPin } from "lucide-react"
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
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={(e) => {
              e.preventDefault()
              setWishlisted(!wishlisted)
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${wishlisted ? "fill-primary text-primary" : "text-foreground/70"}`}
            />
          </button>
          {property.isNew && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
              Nouveau
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-xs font-medium text-foreground">{property.rating}</span>
              <span className="text-xs text-muted-foreground">({property.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">{property.location}, {property.wilaya}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-foreground">{property.price.toLocaleString()} DA</span>
              <span className="text-muted-foreground text-xs"> {t("listing_per_night")}</span>
            </div>
            <span className="text-xs text-muted-foreground">{property.type}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
