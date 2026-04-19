"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Shield,
  Clock,
  Award,
  ArrowRight,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PropertyCard, Property } from "@/components/property-card"
import { useI18n } from "@/lib/i18n-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const DESTINATIONS = [
  { name: "Alger", image: "/images/property-6.jpg" },
  { name: "Oran", image: "/images/property-1.jpg" },
  { name: "Béjaïa", image: "/images/property-3.jpg" },
  { name: "Tlemcen", image: "/images/property-2.jpg" },
]

const CATEGORIES = [
  { labelKey: "type_apartment" as const, icon: "🏢", value: "Appartement" },
  { labelKey: "type_villa" as const, icon: "🏡", value: "Villa" },
  { labelKey: "type_chalet" as const, icon: "🏔️", value: "Chalet" },
  { labelKey: "type_studio" as const, icon: "🏠", value: "Studio" },
  { labelKey: "type_tent" as const, icon: "⛺", value: "Tente de luxe" },
]

export default function HomePage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch featured properties from API
  const { data, isLoading } = useSWR<{ properties: Property[]; total: number }>(
    "/api/properties?limit=6&status=active",
    fetcher
  )

  // Fetch destination counts
  const { data: statsData } = useSWR<{ properties: Property[] }>(
    "/api/properties?limit=1000&status=active",
    fetcher
  )

  const featuredProperties = data?.properties || []
  
  // Calculate destination counts
  const destinationCounts = DESTINATIONS.map((dest) => ({
    ...dest,
    count: statsData?.properties?.filter((p) => p.wilaya === dest.name).length || 0,
  }))

  const totalProperties = statsData?.properties?.length || 0
  const totalWilayas = new Set(statsData?.properties?.map((p) => p.wilaya)).size || 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Algérie"
            fill
            className="object-cover"
            priority
            loading="eager"
          />
          <div className="absolute inset-0 bg-brand-navy-dark/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <Star className="h-3.5 w-3.5 text-accent fill-accent" />
              <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                N°1 Location de Vacances en Algérie
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight text-balance">
              {t("hero_title")}
            </h1>
            <p className="text-white/75 text-lg mb-10 leading-relaxed max-w-xl">
              {t("hero_subtitle")}
            </p>

            {/* Search card */}
            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1 bg-secondary/60 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <Input
                    placeholder={t("hero_search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 sm:w-36">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{t("search_checkin")}</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 sm:w-32">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">2 {t("guests")}</span>
                </div>
                <Link href={`/search?q=${searchQuery}`} className="sm:shrink-0">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto h-full min-h-[46px] px-6 rounded-xl font-semibold shadow-sm gap-2">
                    <Search className="h-4 w-4" />
                    {t("search_btn")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 mt-6">
              {[
                { value: `${totalProperties}+`, label: "Logements" },
                { value: `${totalWilayas}`, label: "Wilayas" },
                { value: "15 000+", label: "Voyageurs" },
              ].map((stat) => (
                <div key={stat.label} className="text-white/80">
                  <span className="font-bold text-white text-lg">{stat.value}</span>
                  <span className="text-xs block text-white/60 mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="py-6 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Link key={cat.value} href={`/search?type=${cat.value}`}>
                <div className="flex items-center gap-2 cursor-pointer group whitespace-nowrap border border-border rounded-full px-4 py-2 hover:border-primary hover:bg-primary/5 transition-all">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors">
                    {t(cat.labelKey)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Top annonces</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
              Logements à la une
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Sélection des meilleurs hébergements en Algérie
            </p>
          </div>
          <Link href="/search" className="hidden sm:flex">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-medium"
            >
              {t("see_all")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Aucune annonce disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/search">
            <Button variant="outline" className="gap-2 border-primary/30 text-primary">
              {t("see_all")} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1.5 text-balance">
            Destinations populaires
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Explorez les villes les plus demandées
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {destinationCounts.map((dest) => (
              <Link key={dest.name} href={`/search?location=${dest.name}`}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg leading-tight">{dest.name}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{dest.count} logements</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorer
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
            Pourquoi choisir Safra ?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            La plateforme de référence pour la location de logements de vacances en Algérie
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <Shield className="h-6 w-6 text-primary" />,
              title: "Logements vérifiés",
              desc: "Chaque annonce est validée par notre équipe. Les propriétaires fournissent des documents officiels.",
            },
            {
              icon: <Clock className="h-6 w-6 text-primary" />,
              title: "Réservation instantanée",
              desc: "Réservez en quelques minutes. Paiement sécurisé via CIB ou Edahabia.",
            },
            {
              icon: <Award className="h-6 w-6 text-primary" />,
              title: "Séjours garantis",
              desc: "Notre équipe est disponible 24h/24 pour vous accompagner avant et pendant votre séjour.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-border rounded-2xl p-7 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="font-semibold text-foreground text-base mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Host CTA */}
      <section className="py-4 px-4 sm:px-6 max-w-7xl mx-auto w-full pb-16">
        <div className="bg-brand-navy rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <Image src="/images/hero-bg.jpg" alt="" fill className="object-cover" />
          </div>
          <div className="relative px-8 py-12 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">
                Devenez hôte
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-balance">
                Vous êtes propriétaire ?
              </h2>
              <p className="text-white/70 text-sm max-w-md leading-relaxed">
                Publiez votre logement sur Safra et commencez à générer des revenus.
                Processus simple, assistance complète, paiement garanti.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/register">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-7 rounded-full shadow-lg gap-2">
                  {t("nav_list_property")}
                  <ArrowRight className="h-4 w-4" />
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
