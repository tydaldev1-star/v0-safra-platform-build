"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Star, MapPin, Users, Bed, Wifi, Wind, ParkingMeterIcon as Parking, Tv, Waves, ChefHat,
  WashingMachine, Home, ChevronLeft, Share, Heart, Calendar, CheckCircle, Shield, Navigation
} from "lucide-react"

// Open Google Maps with directions
function openGoogleMapsDirections(lat: number, lng: number) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  window.open(url, "_blank")
}
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n-context"
import { MOCK_PROPERTIES, MOCK_REVIEWS } from "@/lib/mock-data"

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  ac: <Wind className="h-5 w-5" />,
  parking: <Parking className="h-5 w-5" />,
  pool: <Waves className="h-5 w-5" />,
  kitchen: <ChefHat className="h-5 w-5" />,
  tv: <Tv className="h-5 w-5" />,
  washing_machine: <WashingMachine className="h-5 w-5" />,
  balcony: <Home className="h-5 w-5" />,
}

export default function ListingPage() {
  const { t } = useI18n()
  const params = useParams()
  const property = MOCK_PROPERTIES.find((p) => p.id === params.id) || MOCK_PROPERTIES[0]

  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 0

  const serviceFee = Math.round(property.price * 0.1)
  const total = nights * property.price + serviceFee

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Back */}
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          {t("back")}
        </Link>

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-semibold">{property.rating}</span>
                <span className="text-muted-foreground">({property.reviewCount} {t("listing_reviews")})</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <button 
                onClick={() => property.lat && property.lng && openGoogleMapsDirections(property.lat, property.lng)}
                className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors group"
              >
                <MapPin className="h-4 w-4 group-hover:text-accent" />
                <span className="underline-offset-2 group-hover:underline">
                  {property.location}, {property.wilaya}
                </span>
                <Navigation className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Directions Button */}
            {property.lat && property.lng && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={() => openGoogleMapsDirections(property.lat!, property.lng!)}
              >
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">Itinéraire</span>
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Partager</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setWishlisted(!wishlisted)}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} />
              <span className="hidden sm:inline">Sauvegarder</span>
            </Button>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
          <div className="col-span-2 row-span-2 relative">
            <Image src={property.image} alt={property.title} fill className="object-cover" />
          </div>
          {MOCK_PROPERTIES.slice(1, 5).map((p, i) => (
            <div key={i} className="relative hidden md:block">
              <Image src={p.image} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {property.type} · {property.bedrooms} chambres · {property.guests} {t("guests")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Hébergé par Ahmed K.</p>
              </div>
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">AK</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Shield className="h-5 w-5 text-primary" />, title: "Propriétaire vérifié", desc: "Documents contrôlés par Safra" },
                { icon: <Calendar className="h-5 w-5 text-primary" />, title: "Annulation flexible", desc: "Annulez jusqu'à 48h avant" },
                { icon: <CheckCircle className="h-5 w-5 text-primary" />, title: "Logement certifié", desc: "Conforme aux normes Safra" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  {item.icon}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">{t("listing_description")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bienvenue dans ce magnifique logement situé au cœur de {property.wilaya}. Profitez d&apos;un espace
                chaleureux et entièrement équipé pour un séjour inoubliable. Le logement bénéficie d&apos;une vue
                exceptionnelle et est idéalement situé à proximité des principaux sites touristiques et commerces.
                Vous serez séduit par son design moderne et son confort optimal.
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">{t("listing_amenities")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="text-muted-foreground">{AMENITY_ICONS[a] || <Home className="h-5 w-5" />}</span>
                    {t(a as any)}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Rules */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">{t("listing_rules")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Arrivée : 14h00 – 22h00</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Départ avant 12h00</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Non-fumeur à l&apos;intérieur</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Animaux non acceptés</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Pas de fête ni d&apos;événement</li>
              </ul>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="text-lg font-bold">{property.rating}</span>
                <span className="text-muted-foreground">· {property.reviewCount} {t("listing_reviews")}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {MOCK_REVIEWS.map((rev) => (
                  <div key={rev.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-semibold">
                          {rev.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{rev.user}</p>
                        <p className="text-xs text-muted-foreground">{rev.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-bold text-foreground">{property.price.toLocaleString()} DA</span>
                <span className="text-muted-foreground text-sm">{t("listing_per_night")}</span>
              </div>

              <div className="border border-border rounded-xl overflow-hidden mb-3">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-b border-border">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1">
                      {t("booking_checkin")}
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="text-sm text-foreground bg-transparent w-full outline-none"
                    />
                  </div>
                  <div className="p-3 border-b border-border">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1">
                      {t("booking_checkout")}
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="text-sm text-foreground bg-transparent w-full outline-none"
                    />
                  </div>
                </div>
                <div className="p-3">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1">
                    {t("booking_guests")}
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="text-sm text-foreground bg-transparent w-full outline-none"
                  >
                    {Array.from({ length: property.guests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? t("guest") : t("guests")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Link href={`/booking/${property.id}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold rounded-xl">
                  {t("booking_reserve")}
                </Button>
              </Link>

              <p className="text-center text-xs text-muted-foreground mt-3">{t("booking_not_charged")}</p>

              {nights > 0 && (
                <div className="mt-5 space-y-2 text-sm">
                  <Separator />
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">
                      {property.price.toLocaleString()} DA × {nights} {nights === 1 ? t("night") : t("nights")}
                    </span>
                    <span className="text-foreground">{(property.price * nights).toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("booking_service_fee")}</span>
                    <span className="text-foreground">{serviceFee.toLocaleString()} DA</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-foreground pt-1">
                    <span>{t("booking_total")}</span>
                    <span>{total.toLocaleString()} DA</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
