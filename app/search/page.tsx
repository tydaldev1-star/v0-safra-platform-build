"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, MapPin, X, ChevronDown } from "lucide-react"
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
import { MOCK_PROPERTIES, WILAYAS } from "@/lib/mock-data"

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

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  const filtered = MOCK_PROPERTIES.filter((p) => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Search Bar */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 border border-border rounded-xl px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/30">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 ${showFilters ? "border-primary text-primary" : ""}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t("search_filters")}</span>
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto sm:w-44 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">{t("search_sort_rating")}</SelectItem>
                <SelectItem value="price_asc">{t("search_sort_price_asc")}</SelectItem>
                <SelectItem value="price_desc">{t("search_sort_price_desc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Type */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">{t("search_type")}</p>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? "" : type)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  {t("search_price_range")}: {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()} DA
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
              <div>
                <p className="text-sm font-medium text-foreground mb-3">{t("search_amenities")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES_LIST.map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <Checkbox
                        id={a}
                        checked={selectedAmenities.includes(a)}
                        onCheckedChange={() => toggleAmenity(a)}
                      />
                      <Label htmlFor={a} className="text-xs cursor-pointer">
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

      {/* Results */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <p className="text-sm text-muted-foreground mb-6">
          <span className="font-semibold text-foreground">{filtered.length}</span> {t("search_results")}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun logement trouvé</h3>
            <p className="text-muted-foreground text-sm">
              Essayez de modifier vos critères de recherche ou d&apos;élargir votre zone de recherche.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchLocation("")
                setSelectedType("")
                setPriceRange([0, 30000])
                setSelectedAmenities([])
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
