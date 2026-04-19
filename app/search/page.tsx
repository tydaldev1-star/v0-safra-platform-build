"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import useSWR from "swr"
import {
  Search, SlidersHorizontal, MapPin, X, LayoutList, Map,
  Home, Star, TrendingUp, Building2, ChevronDown, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { useI18n } from "@/lib/i18n-context"

// Dynamically import the map to avoid SSR issues
const MapView = dynamic(() => import("@/components/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-secondary rounded-2xl">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Map className="h-8 w-8 animate-pulse" />
        <span className="text-sm">Chargement de la carte...</span>
      </div>
    </div>
  ),
})

interface Property {
  id: number
  title_fr: string
  title_en: string | null
  title_ar: string | null
  city: string
  wilaya_name_fr: string
  wilaya_name_en: string
  wilaya_name_ar: string
  address: string
  lat: number
  lng: number
  price_per_night: number
  bedrooms: number
  max_guests: number
  property_type: string
  avg_rating: number
  review_count: number
  primary_image: string | null
  images: string[]
  amenities: string[]
  is_featured: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const AMENITIES_LIST = ["wifi", "ac", "parking", "pool", "kitchen", "tv", "balcony"]
const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "villa", label: "Villa" },
  { value: "chalet", label: "Chalet" },
  { value: "studio", label: "Studio" },
  { value: "tent", label: "Tente de luxe" },
  { value: "house", label: "Maison" },
]

export default function SearchPage() {
  const { t, locale } = useI18n()
  const [showFilters, setShowFilters] = useState(false)
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [priceRange, setPriceRange] = useState([0, 30000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("rating")
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split")
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null)
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Build query string for API
  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (searchLocation) params.set("search", searchLocation)
    if (selectedType) params.set("type", selectedType)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 30000) params.set("maxPrice", priceRange[1].toString())
    return params.toString()
  }

  const { data, error, isLoading } = useSWR<{ properties: Property[]; total: number }>(
    `/api/properties?${buildQueryString()}`,
    fetcher
  )

  const properties = data?.properties || []

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 1024 && viewMode === "split") {
        setViewMode("list")
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [viewMode])

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  // Client-side filtering for amenities (API handles other filters)
  const filtered = properties.filter((p) => {
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((a) => p.amenities.includes(a))
    return matchesAmenities
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price_per_night - b.price_per_night
    if (sortBy === "price_desc") return b.price_per_night - a.price_per_night
    if (sortBy === "rating") return b.avg_rating - a.avg_rating
    return 0
  })

  // Map property to PropertyCard format
  const mapToCardFormat = (p: Property) => ({
    id: p.id.toString(),
    title: locale === "ar" ? (p.title_ar || p.title_fr) : locale === "en" ? (p.title_en || p.title_fr) : p.title_fr,
    location: p.city,
    wilaya: locale === "ar" ? p.wilaya_name_ar : locale === "en" ? p.wilaya_name_en : p.wilaya_name_fr,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    price: p.price_per_night,
    rating: p.avg_rating,
    reviewCount: p.review_count,
    image: p.primary_image || p.images[0] || "/images/property-1.jpg",
    type: p.property_type,
    bedrooms: p.bedrooms,
    guests: p.max_guests,
    amenities: p.amenities,
    isNew: false,
  })

  // Stats
  const stats = {
    count: sorted.length,
    wilayas: new Set(sorted.map((p) => p.wilaya_name_fr)).size,
    avgPrice: sorted.length > 0 ? Math.round(sorted.reduce((s, p) => s + p.price_per_night, 0) / sorted.length) : 0,
    topRating: sorted.length > 0 ? Math.max(...sorted.map((p) => p.avg_rating)) : 0,
  }

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Search Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_location")}
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          
          {/* View Mode Toggle - Desktop */}
          <div className="hidden lg:flex items-center bg-secondary rounded-xl p-1 gap-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg h-9 px-3"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4 mr-1.5" />
              {t("list_view")}
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg h-9 px-3"
              onClick={() => setViewMode("split")}
            >
              <Map className="h-4 w-4 mr-1.5" />
              Split
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              className="rounded-lg h-9 px-3"
              onClick={() => setViewMode("map")}
            >
              <Map className="h-4 w-4 mr-1.5" />
              {t("map_view")}
            </Button>
          </div>

          {/* Mobile Map Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden h-11 w-11 shrink-0 rounded-xl"
            onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
          >
            {viewMode === "map" ? <LayoutList className="h-4 w-4" /> : <Map className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-card/50 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type */}
              <div>
                <Label className="text-xs font-medium mb-2 block">{t("search_type")}</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="sm:col-span-2">
                <Label className="text-xs font-medium mb-2 block">{t("search_price_range")}</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={30000}
                    step={500}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{priceRange[0].toLocaleString()} DA</span>
                    <span>{priceRange[1].toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-xs font-medium mb-2 block">{t("search_sort")}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">{t("search_sort_rating")}</SelectItem>
                    <SelectItem value="price_asc">{t("search_sort_price_asc")}</SelectItem>
                    <SelectItem value="price_desc">{t("search_sort_price_desc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <Label className="text-xs font-medium mb-2 block">{t("search_amenities")}</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedAmenities.includes(a)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    {t(a as any)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="border-b bg-secondary/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 shrink-0">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{stats.count}</span>
            <span className="text-xs text-muted-foreground">{t("stats_properties")}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold">{stats.wilayas}</span>
            <span className="text-xs text-muted-foreground">{t("stats_wilayas")}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold">{stats.avgPrice.toLocaleString()} DA</span>
            <span className="text-xs text-muted-foreground">{t("stats_avg_price")}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <span className="text-sm font-semibold">{stats.topRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">{t("stats_top_rated")}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Une erreur est survenue. Veuillez réessayer.
          </div>
        ) : viewMode === "list" ? (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sorted.map((p) => (
                <PropertyCard key={p.id} property={mapToCardFormat(p)} />
              ))}
            </div>
            {sorted.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                Aucun logement trouvé pour cette recherche.
              </div>
            )}
          </div>
        ) : viewMode === "map" ? (
          <div className="h-[calc(100vh-200px)] p-4">
            <MapView
              properties={sorted.map(mapToCardFormat)}
              activeId={activePropertyId}
              onMarkerClick={setActivePropertyId}
              userPosition={userPosition}
              onLocateMe={handleLocateMe}
              locating={locating}
            />
          </div>
        ) : (
          <div className="flex h-[calc(100vh-200px)]">
            {/* List */}
            <div className="w-1/2 overflow-y-auto p-4 scrollbar-thin">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sorted.map((p) => (
                  <div
                    key={p.id}
                    onMouseEnter={() => setActivePropertyId(p.id.toString())}
                    onMouseLeave={() => setActivePropertyId(null)}
                  >
                    <PropertyCard property={mapToCardFormat(p)} />
                  </div>
                ))}
              </div>
            </div>
            {/* Map */}
            <div className="w-1/2 p-4 pl-0">
              <MapView
                properties={sorted.map(mapToCardFormat)}
                activeId={activePropertyId}
                onMarkerClick={setActivePropertyId}
                userPosition={userPosition}
                onLocateMe={handleLocateMe}
                locating={locating}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
