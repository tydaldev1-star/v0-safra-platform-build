"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Search, SlidersHorizontal, MapPin, X, LayoutList, Map,
  Home, Star, TrendingUp, Building2, ChevronDown
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
import { MOCK_PROPERTIES } from "@/lib/mock-data"
import type { PropertyWithCoords } from "@/lib/mock-data"

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

const AMENITIES_LIST = ["wifi", "ac", "parking", "pool", "kitchen", "tv", "balcony"]
const PROPERTY_TYPES = ["Appartement", "Villa", "Chalet", "Studio", "Tente de luxe", "Maison"]

export default function SearchPage() {
  const { t } = useI18n()
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

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-switch to list on mobile if in split mode
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

  const filtered: PropertyWithCoords[] = MOCK_PROPERTIES.filter((p) => {
    const matchesLocation =
      !searchLocation ||
      p.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      p.wilaya.toLowerCase().includes(searchLocation.toLowerCase())
    const matchesType = !selectedType || p.type === selectedType
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((a) => p.amenities.includes(a))
    return matchesLocation && matchesType && matchesPrice && matchesAmenities
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price
    if (sortBy === "price_desc") return b.price - a.price
    return b.rating - a.rating
  })

  // Stats derived from filtered results
  const uniqueWilayas = new Set(filtered.map((p) => p.wilaya)).size
  const avgPrice = filtered.length
    ? Math.round(filtered.reduce((s, p) => s + p.price, 0) / filtered.length)
    : 0
  const topRated = filtered.length
    ? Math.max(...filtered.map((p) => p.rating)).toFixed(1)
    : "—"

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  const handleMarkerClick = useCallback((id: string) => {
    setActivePropertyId(id)
    const el = document.getElementById(`property-card-${id}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [])

  const showList = viewMode === "list" || viewMode === "split"
  const showMap = viewMode === "map" || viewMode === "split"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Sticky Search + Filters Bar */}
      <div className="bg-card border-b border-border sticky top-14 md:top-16 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
          <div className="flex gap-2 items-center">
            {/* Search input */}
            <div className="flex items-center gap-2 flex-1 border border-border rounded-xl px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder={t("search_location")}
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
              />
              {searchLocation && (
                <button onClick={() => setSearchLocation("")}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-1.5 rounded-xl h-9 px-2.5 sm:px-3 ${showFilters ? "border-primary text-primary bg-primary/5" : ""}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">{t("search_filters")}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>

            {/* Sort - hidden on very small screens */}
            <div className="hidden sm:block">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-auto md:w-40 border-border rounded-xl h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">{t("search_sort_rating")}</SelectItem>
                  <SelectItem value="price_asc">{t("search_sort_price_asc")}</SelectItem>
                  <SelectItem value="price_desc">{t("search_sort_price_desc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode switcher - Desktop */}
            <div className="hidden lg:flex items-center border border-border rounded-xl overflow-hidden">
              {(["list", "split", "map"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {mode === "list" && <LayoutList className="h-3.5 w-3.5" />}
                  {mode === "split" && (
                    <span className="flex gap-0.5">
                      <LayoutList className="h-3.5 w-3.5" />
                      <Map className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {mode === "map" && <Map className="h-3.5 w-3.5" />}
                  <span className="hidden xl:inline">
                    {mode === "list" ? t("list_view") : mode === "map" ? t("map_view") : "Split"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-top-2 duration-200">
              {/* Type */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 sm:mb-3 uppercase tracking-wide">{t("search_type")}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? "" : type)}
                      className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-full border transition-all ${
                        selectedType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 sm:mb-3 uppercase tracking-wide">
                  {t("search_price_range")}: <span className="text-accent font-bold">{priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()} DA</span>
                </p>
                <Slider
                  min={0}
                  max={30000}
                  step={500}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </div>
              {/* Amenities */}
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold text-foreground mb-2 sm:mb-3 uppercase tracking-wide">{t("search_amenities")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                  {AMENITIES_LIST.map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <Checkbox
                        id={`amenity-${a}`}
                        checked={selectedAmenities.includes(a)}
                        onCheckedChange={() => toggleAmenity(a)}
                      />
                      <Label htmlFor={`amenity-${a}`} className="text-xs cursor-pointer">
                        {t(a as any)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3 flex items-center gap-3 sm:gap-4 md:gap-8 overflow-x-auto">
          {/* Property count */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">{filtered.length}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t("stats_properties")}</p>
            </div>
          </div>
          <div className="w-px h-7 sm:h-8 bg-border shrink-0 hidden sm:block" />
          {/* Wilayas */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">{uniqueWilayas}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t("stats_wilayas")}</p>
            </div>
          </div>
          <div className="w-px h-7 sm:h-8 bg-border shrink-0 hidden md:block" />
          {/* Avg price - hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">
                {avgPrice > 0 ? `${avgPrice.toLocaleString()} DA` : "—"}
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t("stats_avg_price")}</p>
            </div>
          </div>
          <div className="w-px h-7 sm:h-8 bg-border shrink-0 hidden md:block" />
          {/* Top rated */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold fill-gold" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">{topRated}</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t("stats_top_rated")}</p>
            </div>
          </div>
          
          {/* Mobile/Tablet view toggle */}
          <div className="lg:hidden ml-auto flex items-center border border-border rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`h-8 px-3 flex items-center gap-1.5 text-xs ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("list_view")}</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`h-8 px-3 flex items-center gap-1.5 text-xs ${viewMode === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("map_view")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: List + Map */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className={`flex gap-4 md:gap-5 ${showMap && viewMode === "split" ? "items-start" : ""}`}>

          {/* Property List */}
          {showList && (
            <div className={`flex flex-col gap-3 md:gap-4 ${viewMode === "split" ? "w-full lg:w-[400px] xl:w-[440px] shrink-0" : "w-full"}`}>
              {filtered.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground font-medium">
                    <span className="font-bold text-foreground text-sm">{filtered.length}</span>{" "}
                    {t("search_results")}
                  </p>
                  {viewMode === "split" ? (
                    // Scrollable list in split view (desktop only)
                    <div className="flex flex-col gap-3 md:gap-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
                      {filtered.map((p) => (
                        <div
                          key={p.id}
                          id={`property-card-${p.id}`}
                          onClick={() => setActivePropertyId(p.id === activePropertyId ? null : p.id)}
                          className={`rounded-2xl transition-all cursor-pointer ${
                            activePropertyId === p.id ? "ring-2 ring-accent shadow-lg" : ""
                          }`}
                        >
                          <PropertyCard property={p} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Grid for list-only view (responsive columns)
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                      {filtered.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <MapPin className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">Aucun logement trouvé</h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-4 max-w-xs">
                    Essayez de modifier vos critères ou d&apos;élargir votre zone de recherche.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      setSearchLocation("")
                      setSelectedType("")
                      setPriceRange([0, 30000])
                      setSelectedAmenities([])
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Map Panel */}
          {showMap && (
            <div
              className={`
                rounded-2xl overflow-hidden
                ${viewMode === "map" ? "w-full" : "hidden lg:block flex-1"}
              `}
              style={{ 
                height: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 260px)", 
                position: viewMode === "split" ? "sticky" : "relative", 
                top: viewMode === "split" ? "200px" : "auto" 
              }}
            >
              <MapView
                properties={filtered}
                activeId={activePropertyId}
                onMarkerClick={handleMarkerClick}
                userPosition={userPosition}
                onLocate={handleLocate}
                locating={locating}
              />
            </div>
          )}
        </div>
      </main>

      {viewMode !== "split" && <Footer />}
    </div>
  )
}
