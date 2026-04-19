"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR, { mutate } from "swr"
import {
  Home, Calendar, DollarSign, Plus, BarChart2, FileText, Star,
  CheckCircle, Clock, XCircle, Eye, Trash2, TrendingUp, Users,
  Loader2, AlertTriangle, Phone, Mail, BedDouble, ChevronDown, ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmé",  cls: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
  pending:   { label: "En attente", cls: "bg-amber-100 text-amber-700 border-amber-200",  icon: <Clock className="h-3 w-3" /> },
  cancelled: { label: "Annulé",    cls: "bg-red-100 text-red-700 border-red-200",         icon: <XCircle className="h-3 w-3" /> },
  completed: { label: "Terminé",   cls: "bg-blue-100 text-blue-700 border-blue-200",      icon: <CheckCircle className="h-3 w-3" /> },
}

const PAYMENT_STYLES: Record<string, { label: string; cls: string }> = {
  paid:    { label: "Payé",        cls: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "En attente",  cls: "bg-amber-100 text-amber-700 border-amber-200" },
  refunded:{ label: "Remboursé",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
}

interface Property {
  id: number
  title: string
  location: string
  wilaya: string
  type: string
  price: number
  rating: number
  reviewCount: number
  image: string
  status: string
}

interface Booking {
  id: number
  guest_name: string
  guest_phone: string
  guest_email: string
  property_title: string
  property_image: string | null
  check_in: string
  check_out: string
  guests_count: number
  total_price: number
  payment_status: string
  status: string
  created_at: string
}

interface HostStats {
  totalRevenue: number
  activeBookings: number
  averageRating: number
  totalProperties: number
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function nightsBetween(ci: string, co: string) {
  return Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000))
}

export default function HostDashboard() {
  const { t } = useI18n()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [deletePropertyId, setDeletePropertyId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [bookingAction, setBookingAction] = useState<{ id: number; action: "confirm" | "cancel" } | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null)
  const [actionMessage, setActionMessage] = useState("")

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "host" && user.role !== "admin"))) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const enabled = !authLoading && (user?.role === "host" || user?.role === "admin")

  const { data: propertiesData, mutate: mutateProperties } = useSWR<{ properties: Property[] }>(
    enabled ? "/api/host/properties" : null, fetcher
  )
  const { data: bookingsData, mutate: mutateBookings } = useSWR<{ bookings: Booking[] }>(
    enabled ? "/api/host/bookings" : null, fetcher
  )
  const { data: statsData, mutate: mutateStats } = useSWR<HostStats>(
    enabled ? "/api/host/stats" : null, fetcher
  )

  if (authLoading || !user || (user.role !== "host" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const listings  = propertiesData?.properties || []
  const bookings  = bookingsData?.bookings || []
  const stats     = statsData ?? { totalRevenue: 0, activeBookings: 0, averageRating: 0, totalProperties: 0 }

  const statsList = [
    { label: "Revenus totaux",       value: `${(stats.totalRevenue ?? 0).toLocaleString()} DA`, icon: <DollarSign className="h-5 w-5" />, color: "text-primary" },
    { label: "Réservations actives", value: String(stats.activeBookings ?? 0),                  icon: <Calendar className="h-5 w-5" />,    color: "text-accent" },
    { label: "Note moyenne",         value: (stats.averageRating ?? 0).toFixed(1),              icon: <Star className="h-5 w-5" />,         color: "text-gold" },
    { label: "Annonces actives",     value: String(stats.totalProperties ?? 0),                 icon: <Home className="h-5 w-5" />,         color: "text-foreground" },
  ]

  // --- Delete property ---
  async function handleDeleteProperty() {
    if (!deletePropertyId) return
    setDeleteLoading(true)
    setDeleteError("")
    try {
      const res = await fetch(`/api/host/properties/${deletePropertyId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        setDeleteError(json.error || "Erreur lors de la suppression.")
        return
      }
      mutateProperties()
      mutateStats()
      setDeletePropertyId(null)
    } catch {
      setDeleteError("Erreur réseau.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // --- Toggle property status ---
  async function handleToggleStatus(id: number, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    await fetch(`/api/host/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    mutateProperties()
    mutateStats()
  }

  // --- Confirm / Cancel booking ---
  async function handleBookingAction() {
    if (!bookingAction) return
    setBookingLoading(true)
    try {
      const status = bookingAction.action === "confirm" ? "confirmed" : "cancelled"
      const res = await fetch(`/api/bookings/${bookingAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setActionMessage(bookingAction.action === "confirm" ? "Réservation confirmée." : "Réservation annulée.")
        mutateBookings()
        mutateStats()
      }
    } finally {
      setBookingLoading(false)
      setBookingAction(null)
      setTimeout(() => setActionMessage(""), 3000)
    }
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const recentBookings  = bookings.slice(0, 3)

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("host_dashboard")}</h1>
            <p className="text-muted-foreground text-sm mt-1">Bonjour, {user.full_name} !</p>
          </div>
          <Link href="/host/new-listing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_add_listing")}</span>
            </Button>
          </Link>
        </div>

        {/* Pending bookings banner */}
        {pendingBookings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              <strong>{pendingBookings.length} réservation(s)</strong> en attente de votre confirmation.
            </p>
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 shrink-0"
              onClick={() => setActiveTab("bookings")}>
              Voir
            </Button>
          </div>
        )}

        {/* Action message */}
        {actionMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">{actionMessage}</p>
          </div>
        )}

        {/* Verification banner */}
        {user.verification_status === "pending" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 mb-6">
            <Clock className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800 flex-1">
              Votre compte est en cours de vérification. Vous serez notifié sous 48h.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsList.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-secondary/50 border border-border">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Vue d&apos;ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_listings")}</span>
              {listings.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {listings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_reservations")}</span>
              {pendingBookings.length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_documents")}</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Revenue summary */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Résumé financier</h3>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                {bookings.filter((b) => b.status === "confirmed").length > 0 ? (
                  <div className="space-y-3">
                    {["confirmed", "pending", "cancelled"].map((s) => {
                      const group = bookings.filter((b) => b.status === s)
                      if (!group.length) return null
                      const total = group.reduce((sum, b) => sum + b.total_price, 0)
                      const st = STATUS_STYLES[s]
                      return (
                        <div key={s} className="flex items-center justify-between text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${st.cls}`}>
                            {st.icon} {st.label} ({group.length})
                          </span>
                          <span className="font-semibold text-foreground">{total.toLocaleString()} DA</span>
                        </div>
                      )
                    })}
                    <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
                      <span>Total confirmé</span>
                      <span className="text-primary">{(stats.totalRevenue ?? 0).toLocaleString()} DA</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune réservation pour le moment.</p>
                )}
              </div>

              {/* Recent bookings */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Réservations récentes</h3>
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? recentBookings.map((b) => {
                    const st = STATUS_STYLES[b.status] || STATUS_STYLES.pending
                    return (
                      <div key={b.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-secondary">{b.guest_name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{b.guest_name}</p>
                            <p className="text-xs text-muted-foreground">{b.property_title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{b.total_price.toLocaleString()} DA</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {st.icon}{st.label}
                          </span>
                        </div>
                      </div>
                    )
                  }) : (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucune réservation pour le moment.</p>
                  )}
                </div>
                {bookings.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-xs"
                    onClick={() => setActiveTab("bookings")}>
                    Voir toutes les réservations
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Listings ── */}
          <TabsContent value="listings">
            <div className="space-y-3">
              {listings.length > 0 ? listings.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={p.image || "/images/placeholder.jpg"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{p.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.location}{p.wilaya ? `, ${p.wilaya}` : ""}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        <span className="font-medium">{p.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({p.reviewCount})</span>
                      </span>
                      <span className="text-xs font-semibold text-primary">{p.price.toLocaleString()} DA/nuit</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors cursor-pointer ${
                        p.status === "active"
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                          : p.status === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed"
                          : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                      }`}
                      disabled={p.status === "pending"}
                      title={p.status === "pending" ? "En attente de validation admin" : `Cliquer pour ${p.status === "active" ? "désactiver" : "activer"}`}
                    >
                      {p.status === "active" ? "Active" : p.status === "pending" ? "En attente" : "Inactive"}
                    </button>
                    <Link href={`/listing/${p.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir l'annonce">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Supprimer"
                      onClick={() => { setDeletePropertyId(p.id); setDeleteError("") }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore d&apos;annonces.</p>
                </div>
              )}

              <Link href="/host/new-listing">
                <button className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors mt-2">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">{t("host_add_listing")}</span>
                </button>
              </Link>
            </div>
          </TabsContent>

          {/* ── Bookings ── */}
          <TabsContent value="bookings">
            <div className="space-y-3">
              {bookings.length > 0 ? bookings.map((b) => {
                const st = STATUS_STYLES[b.status] || STATUS_STYLES.pending
                const pay = PAYMENT_STYLES[b.payment_status] || PAYMENT_STYLES.pending
                const nights = nightsBetween(b.check_in, b.check_out)
                const expanded = expandedBooking === b.id

                return (
                  <div key={b.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Row */}
                    <div className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-secondary text-sm font-semibold">
                          {b.guest_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{b.guest_name}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {st.icon}{st.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${pay.cls}`}>
                            {pay.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{b.property_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(b.check_in)} → {formatDate(b.check_out)} · {nights} nuit{nights > 1 ? "s" : ""} · {b.guests_count} voyageur{b.guests_count > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{b.total_price.toLocaleString()} DA</p>
                        <button
                          onClick={() => setExpandedBooking(expanded ? null : b.id)}
                          className="text-xs text-muted-foreground flex items-center gap-0.5 mt-1 ml-auto hover:text-foreground"
                        >
                          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          Détails
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expanded && (
                      <div className="border-t border-border bg-secondary/20 p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <a href={`tel:${b.guest_phone}`} className="hover:text-foreground">
                              {b.guest_phone || "Non renseigné"}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <a href={`mailto:${b.guest_email}`} className="hover:text-foreground truncate">
                              {b.guest_email || "Non renseigné"}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BedDouble className="h-3.5 w-3.5 shrink-0" />
                            <span>{b.property_title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Réservé le {formatDate(b.created_at)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {b.status === "pending" && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                              onClick={() => setBookingAction({ id: b.id, action: "confirm" })}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10 gap-1.5"
                              onClick={() => setBookingAction({ id: b.id, action: "cancel" })}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Refuser
                            </Button>
                          </div>
                        )}
                        {b.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10 gap-1.5"
                            onClick={() => setBookingAction({ id: b.id, action: "cancel" })}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Annuler la réservation
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              }) : (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Documents ── */}
          <TabsContent value="documents">
            <div className="bg-card border border-border rounded-xl p-6 max-w-lg">
              <h3 className="font-semibold text-foreground mb-1">{t("host_documents")}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Téléchargez vos documents pour valider votre compte hôte.
              </p>

              <div className="space-y-3 mb-5">
                {[
                  { name: "Acte de propriété / Contrat de bail", key: "property_doc" },
                  { name: "Pièce d'identité (CIN / Passeport)", key: "id_doc" },
                ].map((doc) => {
                  const uploaded = doc.key === "id_doc" ? !!user.is_verified : false
                  return (
                    <div key={doc.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{doc.name}</span>
                      </div>
                      {uploaded ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
                          <CheckCircle className="h-3 w-3" /> Soumis
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs gap-1">
                          <Clock className="h-3 w-3" /> En attente
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className={`p-3 rounded-lg border text-xs ${
                user.verification_status === "approved"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : user.verification_status === "rejected"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                <strong>Statut du compte : </strong>
                {user.verification_status === "approved" && "Vérifié — Votre compte est pleinement actif."}
                {user.verification_status === "rejected" && "Rejeté — Contactez l'administration pour plus d'informations."}
                {user.verification_status === "pending"  && "En attente — Vos documents sont en cours d'examen (48h)."}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Pour soumettre vos documents, veuillez contacter l&apos;administration à{" "}
                <a href="mailto:admin@safra.dz" className="text-primary hover:underline">admin@safra.dz</a>.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete property dialog */}
      <AlertDialog open={deletePropertyId !== null} onOpenChange={(o) => { if (!o) setDeletePropertyId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;annonce ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;annonce et toutes ses images seront supprimées définitivement.
              {deleteError && (
                <span className="block mt-2 text-destructive font-medium">{deleteError}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteProperty() }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking action dialog */}
      <AlertDialog open={bookingAction !== null} onOpenChange={(o) => { if (!o) setBookingAction(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bookingAction?.action === "confirm" ? "Confirmer la réservation ?" : "Annuler la réservation ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bookingAction?.action === "confirm"
                ? "Le voyageur sera notifié que sa réservation est confirmée."
                : "Le voyageur sera notifié que sa réservation est annulée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bookingLoading}>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleBookingAction() }}
              disabled={bookingLoading}
              className={bookingAction?.action === "confirm"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {bookingLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : bookingAction?.action === "confirm" ? "Confirmer" : "Annuler"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
