"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Search, MapPin, Calendar, Users, Star, Shield, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { useI18n } from "@/lib/i18n-context"
import { MOCK_PROPERTIES, WILAYAS } from "@/lib/mock-data"

export default function HomePage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")

  const featuredProperties = MOCK_PROPERTIES.slice(0, 6)

  const CATEGORIES = [
    { label: t("type_apartment"), icon: "🏢", value: "Appartement" },
    { label: t("type_villa"), icon: "🏡", value: "Villa" },
    { label: t("type_chalet"), icon: "🏔️", value: "Chalet" },
    { label: t("type_studio"), icon: "🏠", value: "Studio" },
    { label: t("type_tent"), icon: "⛺", value: "Tente de luxe" },
  ]

  const DESTINATIONS = [
    { name: "Alger", image: "/images/property-6.jpg", count: 48 },
    { name: "Oran", image: "/images/property-1.jpg", count: 31 },
    { name: "Béjaïa", image: "/images/property-3.jpg", count: 24 },
    { name: "Tlemcen", image: "/images/property-2.jpg", count: 19 },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[580px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Algérie"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight text-balance">
              {t("hero_title")}
            </h1>
            <p className="text-white/85 text-lg mb-8 leading-relaxed">
              {t("hero_subtitle")}
            </p>

            {/* Search bar */}
            <div className="bg-card rounded-2xl p-4 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1 border border-border rounded-xl px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/30">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder={t("hero_search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background sm:w-36">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{t("search_checkin")}</span>
                </div>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background sm:w-32">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{t("search_guests")}</span>
                </div>
                <Link href={`/search?q=${searchQuery}`}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto px-6 h-full min-h-10 rounded-xl">
                    <Search className="h-4 w-4 mr-2" />
                    {t("search_btn")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 bg-secondary/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Link key={cat.value} href={`/search?type=${cat.value}`}>
                <div className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group">
                  <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center text-xl group-hover:border-primary group-hover:shadow-sm transition-all">
                    {cat.icon}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Logements à la une</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sélection des meilleurs hébergements en Algérie</p>
          </div>
          <Link href="/search">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              {t("see_all")}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/search">
            <Button variant="outline">{t("see_all")}</Button>
          </Link>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-14 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Destinations populaires</h2>
          <p className="text-muted-foreground text-sm mb-8">Explorez les villes les plus demandées</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DESTINATIONS.map((dest) => (
              <Link key={dest.name} href={`/search?location=${dest.name}`}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                    <p className="text-white/80 text-sm">{dest.count} logements</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Safra */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-3">Pourquoi choisir Safra ?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            La plateforme de référence pour la location de logements en Algérie
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield className="h-6 w-6" />,
              title: "Logements vérifiés",
              desc: "Chaque annonce est validée par notre équipe. Les propriétaires fournissent des documents officiels.",
            },
            {
              icon: <Clock className="h-6 w-6" />,
              title: "Réservation instantanée",
              desc: "Réservez en quelques minutes. Paiement sécurisé via CIB ou Edahabia.",
            },
            {
              icon: <Award className="h-6 w-6" />,
              title: "Séjours garantis",
              desc: "Notre équipe est disponible 24h/24 pour vous accompagner avant et pendant votre séjour.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Host Banner */}
      <section className="py-12 bg-accent/10 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Vous êtes propriétaire ?</h2>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Publiez votre logement sur Safra et commencez à générer des revenus. Processus simple, assistance complète.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                  {t("nav_list_property")}
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="px-6">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
