"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import {
  Search, MapPin, Calendar, Users, Shield, Clock, Award,
  ArrowRight, Loader2, CheckCircle, Home, Minus, Plus, ChevronDown,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PropertyCard, Property } from "@/components/property-card"
import { useI18n } from "@/lib/i18n-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const TYPES = [
  { label: "Appartements", value: "Appartement" },
  { label: "Villas",       value: "Villa"        },
  { label: "Chalets",      value: "Chalet"       },
  { label: "Studios",      value: "Studio"       },
  { label: "Tentes luxe",  value: "Tente de luxe"},
]

export default function HomePage() {
  const { t } = useI18n()
  const [location, setLocation] = useState("")
  const [checkin, setCheckin]   = useState("")
  const [checkout, setCheckout] = useState("")

  // Guests popover state
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [datesOpen,  setDatesOpen]  = useState(false)
  const [adults, setAdults]         = useState(2)
  const [children, setChildren]     = useState(0)
  const [rooms, setRooms]           = useState(1)
  const guestsRef = useRef<HTMLDivElement>(null)
  const datesRef  = useRef<HTMLDivElement>(null)

  // Close popovers on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setGuestsOpen(false)
      }
      if (datesRef.current && !datesRef.current.contains(e.target as Node)) {
        setDatesOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const guestLabel = `${adults} adulte${adults > 1 ? "s" : ""} · ${children} enfant${children !== 1 ? "s" : ""} · ${rooms} chambre${rooms > 1 ? "s" : ""}`

  const { data, isLoading } = useSWR<{ properties: Property[] }>(
    "/api/properties?limit=8&status=active", fetcher
  )
  const featuredProperties = data?.properties || []

  const { data: wilayasData } = useSWR<{ wilayas: any[] }>(
    "/api/wilayas", fetcher
  )
  const topWilayas = (wilayasData?.wilayas || [])
    .filter((w) => Number(w.property_count) > 0)
    .slice(0, 8)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("q", location)
    if (checkin)  params.set("checkin", checkin)
    if (checkout) params.set("checkout", checkout)
    params.set("guests", String(adults))
    window.location.href = `/search?${params.toString()}`
  }

  function Counter({
    label, value, min = 0, onChange,
  }: { label: string; value: number; min?: number; onChange: (v: number) => void }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-[#e7e7e7] last:border-0">
        <span className="text-[14px] text-[#333] font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="w-8 h-8 rounded-full border border-[#0071c2] text-[#0071c2] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ebf3ff] transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-[14px] font-semibold text-[#333]">{value}</span>
          <button
            onClick={() => onChange(value + 1)}
            className="w-8 h-8 rounded-full border border-[#0071c2] text-[#0071c2] flex items-center justify-center hover:bg-[#ebf3ff] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#003580] pb-0">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Algérie"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-balance leading-tight">
            {t("hero_title")}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6">
            {t("hero_subtitle")}
          </p>

          {/* Search bar */}
          <div className="w-full max-w-5xl">
            {/* Mobile: stacked column with yellow outline */}
            <div className="flex flex-col sm:flex-row rounded-lg overflow-visible border-2 border-[#ffb700] bg-[#ffb700] gap-[1px]">
              {/* Location */}
              <div className="flex-1 bg-white flex items-center gap-2 px-3 py-3 min-w-0 sm:border-r sm:border-b-0 border-b border-[#e7e7e7]">
                <MapPin className="h-4 w-4 text-[#6b6b6b] shrink-0" />
                <input
                  type="text"
                  placeholder="Où voulez-vous aller ?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 text-sm text-[#333] placeholder:text-[#6b6b6b] bg-transparent border-0 outline-none min-w-0 text-[16px] sm:text-sm"
                />
              </div>

              {/* Dates — combined Booking.com style */}
              <div className="relative bg-white sm:border-r sm:border-b-0 border-b border-[#e7e7e7] sm:w-80" ref={datesRef}>
                <button
                  type="button"
                  onClick={() => setDatesOpen((v) => !v)}
                  className="w-full h-full flex items-center gap-2 px-3 py-3 text-left"
                >
                  <Calendar className="h-4 w-4 text-[#6b6b6b] shrink-0" />
                  <div className="flex-1 flex items-center gap-1 text-sm min-w-0">
                    <span className={checkin ? "text-[#333] font-medium" : "text-[#6b6b6b]"}>
                      {checkin ? new Date(checkin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "Date d'arrivée"}
                    </span>
                    <span className="text-[#6b6b6b] mx-0.5">—</span>
                    <span className={checkout ? "text-[#333] font-medium" : "text-[#6b6b6b]"}>
                      {checkout ? new Date(checkout).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "Date de départ"}
                    </span>
                  </div>
                </button>

                {/* Date picker dropdown */}
                {datesOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#e7e7e7] rounded shadow-xl p-4 flex flex-col sm:flex-row gap-4 w-[calc(100vw-2rem)] sm:w-auto max-w-sm sm:max-w-none">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wide">Date d&apos;arrivée</label>
                      <input
                        type="date"
                        value={checkin}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          setCheckin(e.target.value)
                          if (checkout && e.target.value >= checkout) setCheckout("")
                        }}
                        className="border border-[#e7e7e7] rounded px-3 py-2 text-sm text-[#333] outline-none focus:border-[#0071c2]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wide">Date de départ</label>
                      <input
                        type="date"
                        value={checkout}
                        min={checkin || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setCheckout(e.target.value)}
                        className="border border-[#e7e7e7] rounded px-3 py-2 text-sm text-[#333] outline-none focus:border-[#0071c2]"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => setDatesOpen(false)}
                        className="w-full sm:w-auto px-5 py-2 border border-[#0071c2] text-[#0071c2] text-sm font-semibold rounded hover:bg-[#ebf3ff] transition-colors whitespace-nowrap"
                      >
                        Terminer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Guests — popover trigger */}
              <div className="relative bg-white sm:border-r sm:border-b-0 border-b border-[#e7e7e7] sm:w-56" ref={guestsRef}>
                <button
                  type="button"
                  onClick={() => setGuestsOpen((v) => !v)}
                  className="w-full h-full flex items-center gap-2 px-3 py-3 text-left"
                >
                  <Users className="h-4 w-4 text-[#6b6b6b] shrink-0" />
                  <span className="flex-1 text-sm text-[#333] truncate">{guestLabel}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-[#6b6b6b] transition-transform shrink-0 ${guestsOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown panel */}
                {guestsOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-[#e7e7e7] rounded shadow-xl p-4">
                    <Counter label="Adultes"  value={adults}   min={1} onChange={setAdults}   />
                    <Counter label="Enfants"  value={children} min={0} onChange={setChildren} />
                    <Counter label="Chambres" value={rooms}    min={1} onChange={setRooms}    />
                    <button
                      onClick={() => setGuestsOpen(false)}
                      className="mt-4 w-full py-2 border border-[#0071c2] text-[#0071c2] text-sm font-semibold rounded hover:bg-[#ebf3ff] transition-colors"
                    >
                      Terminer
                    </button>
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="bg-[#0071c2] hover:bg-[#005fa3] text-white px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-colors sm:rounded-r-[4px]"
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
              { icon: <Shield className="h-4 w-4" />,      label: "Paiement sécurisé" },
              { icon: <Clock className="h-4 w-4" />,       label: "Annulation gratuite" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white/80 text-[13px]">
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property type filter — visible on all screen sizes */}
      <div className="bg-white border-b border-[#e7e7e7] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {TYPES.map((tp) => (
              <Link key={tp.value} href={`/search?type=${encodeURIComponent(tp.value)}`}>
                <div className="flex items-center gap-1.5 border border-[#e7e7e7] hover:border-[#0071c2] hover:text-[#0071c2] text-[#333] text-[13px] font-medium px-4 py-2 rounded whitespace-nowrap transition-colors cursor-pointer">
                  {tp.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Destinations — real from DB */}
      {topWilayas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <h2 className="text-xl font-bold text-foreground mb-5">
            Destinations populaires en Algérie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topWilayas.slice(0, 8).map((w) => (
              <Link key={w.id} href={`/search?wilaya=${encodeURIComponent(w.name_fr)}`}>
                <div className="relative rounded overflow-hidden group cursor-pointer aspect-[4/3] bg-[#003580]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/20 text-6xl font-black select-none">{w.name_fr?.charAt(0)}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003580]/90 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="text-white font-bold text-base leading-tight">{w.name_fr}</h3>
                    <p className="text-white/75 text-[12px]">{w.property_count} logement{Number(w.property_count) !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">Logements à la une</h2>
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

      {/* Why Safra */}
      <section className="bg-white border-t border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Pourquoi choisir Safra ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Shield className="h-7 w-7 text-primary" />,
                title: "Logements vérifiés",
                desc: "Chaque annonce est validée par notre équipe avec documents officiels.",
              },
              {
                icon: <CheckCircle className="h-7 w-7 text-primary" />,
                title: "Paiements sécurisés",
                desc: "Transactions 100% sécurisées via CIB, Edahabia et virement bancaire.",
              },
              {
                icon: <Clock className="h-7 w-7 text-primary" />,
                title: "Réservation simple",
                desc: "Réservez en quelques clics, annulation gratuite sur la plupart des logements.",
              },
              {
                icon: <Award className="h-7 w-7 text-primary" />,
                title: "Assistance 24h/24",
                desc: "Notre équipe vous accompagne avant et pendant votre séjour, 7j/7.",
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

      {/* Host CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="bg-[#003580] rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
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
