"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Bed, Users, Heart, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useI18n } from "@/lib/i18n-context"

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
  is_featured?: boolean
}

interface PropertyCardProps {
  property: Property
}

function ratingLabel(r: number): string {
  if (r >= 9) return "Exceptionnel"
  if (r >= 8) return "Très bien"
  if (r >= 7) return "Bien"
  if (r >= 6) return "Satisfaisant"
  return ""
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { t } = useI18n()
  const [wishlisted, setWishlisted] = useState(false)
  const rating10 = property.rating ? Number((property.rating * 2).toFixed(1)) : 0
  const imageSrc = property.image?.startsWith("/") ? property.image : (property.image || "/images/property-1.jpg")

  return (
    <Link href={`/listing/${property.id}`} className="block focus:outline-none group">
      {/* Card: stacks vertically on mobile, horizontal on md+ */}
      <div className="bg-white border border-[#e7e7e7] rounded overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">

        {/* Image — full width on mobile, fixed width on desktop */}
        <div className="relative w-full md:w-[220px] md:shrink-0 overflow-hidden bg-[#f2f2f2] aspect-[16/9] md:aspect-auto md:h-auto min-h-[180px] md:min-h-0">
          <Image
            src={imageSrc}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            unoptimized={imageSrc.startsWith("/uploads/")}
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/property-1.jpg" }}
          />
          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
            aria-label="Favoris"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
          </button>
          {property.isNew && (
            <span className="absolute top-2 left-2 bg-[#e8f4ff] text-primary text-[10px] font-bold px-2 py-0.5 rounded">
              Nouveau
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            {/* Type + featured */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                {property.type}
              </span>
              {property.is_featured && (
                <span className="bg-[#febb02] text-[#003580] text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Recommandé
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-bold text-primary hover:underline leading-tight line-clamp-2 mb-1">
              {property.title}
            </h3>

            {/* Location */}
            <p className="text-[12px] text-muted-foreground flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3 shrink-0" />
              {property.location}, {property.wilaya}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Bed className="h-3.5 w-3.5" />
                {property.bedrooms} chambre{property.bedrooms !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {property.guests} voyageur{property.guests !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-[#00795b] font-medium">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              Annulation gratuite
            </div>
          </div>

          {/* Bottom: score + price */}
          <div className="flex items-end justify-between mt-4 pt-3 border-t border-[#e7e7e7] gap-3 flex-wrap sm:flex-nowrap">
            {/* Score */}
            <div className="flex items-center gap-2">
              {rating10 > 0 ? (
                <>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-[#003580] text-white text-[13px] font-bold shrink-0">
                    {rating10.toFixed(1)}
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-foreground leading-tight">{ratingLabel(rating10)}</p>
                    <p className="text-[11px] text-muted-foreground">{property.reviewCount} avis</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Nouveau logement
                </div>
              )}
            </div>

            {/* Price + CTA */}
            <div className="text-right shrink-0">
              <p className="text-[11px] text-muted-foreground">À partir de</p>
              <p className="text-[20px] font-bold text-foreground leading-tight">
                {Number(property.price).toLocaleString("fr-DZ")} DA
              </p>
              <p className="text-[11px] text-muted-foreground mb-2">{t("listing_per_night")}</p>
              <button className="bg-[#0071c2] hover:bg-[#005fa3] text-white text-sm font-bold py-2 px-5 rounded transition-colors w-full sm:w-auto">
                Voir
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
