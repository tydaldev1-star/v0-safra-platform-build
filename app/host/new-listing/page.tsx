"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import {
  ArrowLeft, ArrowRight, Upload, X, Loader2, CheckCircle,
  Home, MapPin, DollarSign, Users, BedDouble, Bath, Ruler,
  Wifi, Wind, ParkingMeter, Tv, ChefHat, Waves, Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "villa",     label: "Villa" },
  { value: "house",     label: "Maison" },
  { value: "studio",    label: "Studio" },
  { value: "chalet",    label: "Chalet" },
  { value: "tent",      label: "Tente / Camping" },
  { value: "room",      label: "Chambre privée" },
]

const ICON_MAP: Record<string, React.ReactNode> = {
  Wifi: <Wifi className="h-4 w-4" />,
  Wind: <Wind className="h-4 w-4" />,
  ParkingMeter: <ParkingMeter className="h-4 w-4" />,
  Tv: <Tv className="h-4 w-4" />,
  ChefHat: <ChefHat className="h-4 w-4" />,
  Waves: <Waves className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
}

const STEPS = ["Type", "Localisation", "Détails", "Photos", "Équipements", "Confirmation"]

export default function NewListingPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title_fr: "",
    title_en: "",
    description_fr: "",
    property_type: "",
    address: "",
    city: "",
    wilaya_id: "",
    lat: "",
    lng: "",
    price_per_night: "",
    bedrooms: "1",
    bathrooms: "1",
    max_guests: "2",
    area_sqm: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])

  const { data: wilayasData } = useSWR("/api/wilayas", fetcher)
  const { data: amenitiesData } = useSWR("/api/amenities", fetcher)

  const wilayas = wilayasData?.wilayas || []
  const amenities = amenitiesData?.amenities || []

  if (!authLoading && (!user || (user.role !== "host" && user.role !== "admin"))) {
    router.push("/login")
    return null
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // When wilaya is selected, auto-fill lat/lng from the wilaya record
  function handleWilayaChange(id: string) {
    set("wilaya_id", id)
    const found = wilayas.find((w: any) => String(w.id) === id)
    if (found) {
      set("lat", String(found.lat))
      set("lng", String(found.lng))
      if (!form.city) set("city", found.name_fr)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingImages(true)
    setError("")
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("doc_type", "property_image")
        const res = await fetch("/api/host/documents", { method: "POST", body: fd })
        const json = await res.json()
        if (res.ok && json.url) {
          uploaded.push(json.url)
        } else {
          setError(json.error || "Erreur lors du téléchargement d'une image.")
        }
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 10))
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  function toggleAmenity(id: number) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  function validateStep(): boolean {
    setError("")
    if (step === 0 && !form.property_type) { setError("Sélectionnez un type de logement."); return false }
    if (step === 1) {
      if (!form.wilaya_id) { setError("Sélectionnez une wilaya."); return false }
      if (!form.city.trim()) { setError("Entrez la ville."); return false }
      if (!form.address.trim()) { setError("Entrez l'adresse."); return false }
    }
    if (step === 2) {
      if (!form.title_fr.trim()) { setError("Entrez le titre de l'annonce."); return false }
      if (!form.price_per_night || Number(form.price_per_night) <= 0) { setError("Entrez un prix par nuit valide."); return false }
    }
    if (step === 3 && images.length === 0) { setError("Ajoutez au moins une photo."); return false }
    return true
  }

  function next() {
    if (!validateStep()) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setError("")
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/host/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          wilaya_id: Number(form.wilaya_id),
          lat: Number(form.lat),
          lng: Number(form.lng),
          price_per_night: Number(form.price_per_night),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          max_guests: Number(form.max_guests),
          area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
          images,
          amenities: selectedAmenities,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Erreur lors de la soumission.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Erreur réseau.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Annonce soumise !</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Votre annonce est en cours de vérification par notre équipe. Elle sera publiée sous 24-48h.
            </p>
            <Button className="w-full bg-primary text-primary-foreground" onClick={() => router.push("/host")}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => step === 0 ? router.push("/host") : back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nouvelle annonce</h1>
            <p className="text-xs text-muted-foreground">Étape {step + 1} sur {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-1.5 mb-8">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6">

          {/* Step 0 — Type */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Type de logement</h2>
              <p className="text-sm text-muted-foreground mb-5">Quel type de logement proposez-vous ?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => set("property_type", t.value)}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                      form.property_type === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    <Home className="h-6 w-6 mx-auto mb-2 opacity-70" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-1">Localisation</h2>
              <p className="text-sm text-muted-foreground mb-4">Où se trouve votre logement ?</p>

              <div>
                <Label htmlFor="wilaya">Wilaya *</Label>
                <select
                  id="wilaya"
                  value={form.wilaya_id}
                  onChange={(e) => handleWilayaChange(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sélectionner une wilaya</option>
                  {wilayas.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name_fr}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="city">Ville / Commune *</Label>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="Ex: Bab El Oued" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="address">Adresse complète *</Label>
                <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)}
                  placeholder="Ex: 12 Rue des Palmiers, Hydra" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" value={form.lat} onChange={(e) => set("lat", e.target.value)}
                    placeholder="36.7538" className="mt-1" type="number" step="any" />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" value={form.lng} onChange={(e) => set("lng", e.target.value)}
                    placeholder="3.0588" className="mt-1" type="number" step="any" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Les coordonnées sont pré-remplies depuis la wilaya. Vous pouvez les affiner.
              </p>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-1">Détails du logement</h2>

              <div>
                <Label htmlFor="title_fr">Titre de l&apos;annonce (Français) *</Label>
                <Input id="title_fr" value={form.title_fr} onChange={(e) => set("title_fr", e.target.value)}
                  placeholder="Ex: Villa avec piscine vue mer à Tipaza" className="mt-1" maxLength={150} />
              </div>

              <div>
                <Label htmlFor="title_en">Titre (Anglais)</Label>
                <Input id="title_en" value={form.title_en} onChange={(e) => set("title_en", e.target.value)}
                  placeholder="Ex: Sea view villa with pool in Tipaza" className="mt-1" maxLength={150} />
              </div>

              <div>
                <Label htmlFor="description_fr">Description (Français)</Label>
                <Textarea id="description_fr" value={form.description_fr}
                  onChange={(e) => set("description_fr", e.target.value)}
                  placeholder="Décrivez votre logement : atmosphère, particularités, quartier..." className="mt-1 min-h-24" />
              </div>

              <div>
                <Label htmlFor="price">Prix par nuit (DA) *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="price" type="number" min="0" value={form.price_per_night}
                    onChange={(e) => set("price_per_night", e.target.value)}
                    placeholder="5000" className="pl-9" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" />Chambres</Label>
                  <Input type="number" min="1" max="20" value={form.bedrooms}
                    onChange={(e) => set("bedrooms", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" />SDB</Label>
                  <Input type="number" min="1" max="10" value={form.bathrooms}
                    onChange={(e) => set("bathrooms", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Voyageurs</Label>
                  <Input type="number" min="1" max="30" value={form.max_guests}
                    onChange={(e) => set("max_guests", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" />Surface (m²)</Label>
                  <Input type="number" min="10" value={form.area_sqm}
                    onChange={(e) => set("area_sqm", e.target.value)} placeholder="80" className="mt-1" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Photos */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Photos</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Ajoutez au moins 1 photo (max 10). La première sera la photo principale.
              </p>

              {/* Upload zone */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages || images.length >= 10}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {uploadingImages
                  ? <Loader2 className="h-8 w-8 animate-spin" />
                  : <Upload className="h-8 w-8" />
                }
                <span className="text-sm font-medium">
                  {uploadingImages ? "Téléchargement..." : "Cliquer pour ajouter des photos"}
                </span>
                <span className="text-xs">JPG, PNG, WEBP — max 10 Mo par fichier</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Preview grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-border">
                      <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Amenities */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Équipements</h2>
              <p className="text-sm text-muted-foreground mb-5">Sélectionnez les équipements disponibles.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map((a: any) => {
                  const selected = selectedAmenities.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAmenity(a.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-left ${
                        selected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      <span className="shrink-0">{ICON_MAP[a.icon] || <Home className="h-4 w-4" />}</span>
                      {a.name_fr}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 5 — Confirmation */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Confirmation</h2>
              <p className="text-sm text-muted-foreground mb-5">Vérifiez les informations avant de soumettre.</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-foreground capitalize">{form.property_type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Titre</span>
                  <span className="font-medium text-foreground text-right max-w-[60%]">{form.title_fr}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Localisation</span>
                  <span className="font-medium text-foreground">{form.city}, {wilayas.find((w: any) => String(w.id) === form.wilaya_id)?.name_fr}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Prix / nuit</span>
                  <span className="font-semibold text-primary">{Number(form.price_per_night).toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Chambres / SDB / Voyageurs</span>
                  <span className="font-medium text-foreground">{form.bedrooms} / {form.bathrooms} / {form.max_guests}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-medium text-foreground">{images.length} photo{images.length > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Équipements</span>
                  <span className="font-medium text-foreground">{selectedAmenities.length} sélectionné{selectedAmenities.length > 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Votre annonce sera soumise pour validation. Elle sera visible après approbation par notre équipe (24-48h).
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {step < STEPS.length - 1 ? (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={next}>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Soumettre l&apos;annonce
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
