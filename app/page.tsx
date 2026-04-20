"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import {
  Search, MapPin, Calendar, Users, Shield, Clock, Award,
  ArrowRight, Star, Loader2, CheckCircle, Home,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PropertyCard, Property } from "@/components/property-card"
import { useI18n } from "@/lib/i18n-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const DESTINATIONS = [
  { name: "Alger",   image: "/images/property-6.jpg", count: "150+" },
  { name: "Oran",    image: "/images/property-1.jpg", count: "80+"  },
  { name: "Béjaïa",  image: "/images/property-3.jpg", count: "60+"  },
  { name: "Tlemcen", image: "/images/property-2.jpg", count: "45+"  },
]

const TYPES = [
  { label: "Appartements", value: "Appartement", icon: "🏢" },
  { label: "Villas",       value: "Villa",        icon: "🏡" },
  { label: "Chalets",      value: "Chalet",       icon: "🏔️" },
  { label: "Studios",      value: "Studio",       icon: "🏠" },
  { label: "Camping luxe", value: "Tente de luxe",icon: "⛺" },
]

export default function HomePage() {
  const { t } = useI18n()
  const [location, setLocation] = useState("")
  const [checkin, setCheckin]   = useState("")
  const [checkout, setCheckout] = useState("")
  const [guests, setGuests]     = useState("2")

  const { data, isLoading } = useSWR<{ properties: Property[] }>(
    "/api/properties?limit=8&status=active", fetcher
  )
  const featuredProperties = data?.properties || []

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("q", location)
    if (checkin)  params.set("checkin", checkin)
    if (checkout) params.set("checkout", checkout)
    if (guests)   params.set("guests", guests)
    window.location.href = `/search?${params.toString()}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#003580] pb-0">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Algérie"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <h1 className="text-white text-3xl sm:text-4xl font-bold mb-2 text-balance">
            {t("hero_title")}
          </h1>
          <p className="text-white/80 text-base mb-8">
            {t("hero_subtitle")}
          </p>

          {/* Booking.com yellow search bar */}
          <div className="bg-[#ffb700] p-2 rounded-lg inline-block w-full max-w-5xl">
            <div className="flex flex-col sm:flex-row gap-1">
              {/* Location */}
              <div className="flex-1 bg-white border-2 border-[#ffb700] rounded flex items-center gap-2 px-3 py-2.5 min-w-0">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Où voulez-vous aller ?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent border-0 outline-none min-w-0"
                />
              </div>

              {/* Check-in */}
              <div className="bg-white border-2 border-[#ffb700] rounded flex items-center gap-2 px-3 py-2.5 sm:w-40">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="date"
                  value={checkin}
                  onChange={(e) => setCheckin(e.target.value)}
                  className="flex-1 text-sm text-foreground bg-transparent border-0 outline-none w-full"
                />
              </div>

              {/* Check-out */}
              <div className="bg-white border-2 border-[#ffb700] rounded flex items-center gap-2 px-3 py-2.5 sm:w-40">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="date"
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  className="flex-1 text-sm text-foreground bg-transparent border-0 outline-none w-full"
                />
              </div>

              {/* Guests */}
              <div className="bg-white border-2 border-[#ffb700] rounded flex items-center gap-2 px-3 py-2.5 sm:w-32">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="flex-1 text-sm text-foreground bg-transparent border-0 outline-none w-full"
                >
                  {[1,2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>{n} voyageur{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="btn-bk px-6 py-2.5 text-sm font-bold flex items-center gap-2 shrink-0 rounded"
              >
                <Search className="h-4 w-4" />
                {t("search_btn")}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: <CheckCircle className="h-4 w-4" />, label: "Logements vérifiés" },
              { icon: <Shield className="h-4 w-4" />, label: "Paiement sécurisé" },
              { icon: <Clock className="h-4 w-4" />, label: "Annulation gratuite" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white/80 text-[13px]">
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property type filter tabs ── */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
            {TYPES.map((t) => (
              <Link key={t.value} href={`/search?type=${encodeURIComponent(t.value)}`}>
                <div className="flex items-center gap-2 border border-border hover:border-primary hover:text-primary text-foreground/70 text-[13px] font-medium px-4 py-2 rounded whitespace-nowrap transition-colors cursor-pointer">
                  <span>{t.icon}</span>
                  {t.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popular Destinations ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h2 className="text-xl font-bold text-foreground mb-5">
          Destinations populaires en Algérie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DESTINATIONS.map((dest) => (
            <Link key={dest.name} href={`/search?location=${dest.name}`}>
              <div className="relative rounded overflow-hidden group cursor-pointer aspect-[4/3]">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-white font-bold text-base leading-tight">{dest.name}</h3>
                  <p className="text-white/75 text-[12px]">{dest.count} logements</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Logements à la une
          </h2>
          <Link href="/search" className="text-primary text-[13px] font-semibold hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded p-8">
            <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucun logement disponible pour le moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Why Safra ── */}
      <section className="bg-white border-t border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Pourquoi choisir Safra ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="h-7 w-7 text-primary" />,
                title: "Logements vérifiés",
                desc: "Chaque annonce est validée par notre équipe avec documents officiels.",
              },
              {
                icon: <Clock className="h-7 w-7 text-primary" />,
                title: "Réservation simple",
                desc: "Réservez en quelques clics. Paiement sécurisé CIB / Edahabia.",
              },
              {
                icon: <Award className="h-7 w-7 text-primary" />,
                title: "Assistance 24h/24",
                desc: "Notre équipe vous accompagne avant et pendant votre séjour.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#ebf3ff] rounded flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Host CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="bg-[#003580] rounded-lg overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <p className="text-[#febb02] text-[13px] font-bold uppercase tracking-wider mb-2">Devenez hôte</p>
            <h2 className="text-2xl font-bold mb-2 text-balance">Vous êtes propriétaire ?</h2>
            <p className="text-white/70 text-[14px] max-w-md leading-relaxed">
              Publiez votre logement et commencez à générer des revenus. Processus simple, assistance complète.
            </p>
          </div>
          <Link href="/register" className="shrink-0">
            <button className="bg-[#0071c2] hover:bg-[#005fa3] text-white font-bold px-8 py-3 rounded text-sm transition-colors flex items-center gap-2">
              {t("nav_list_property")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
