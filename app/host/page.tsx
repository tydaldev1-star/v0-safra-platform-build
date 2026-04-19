"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import {
  Home, Calendar, DollarSign, Plus, BarChart2, FileText, Star,
  CheckCircle, Clock, XCircle, Eye, Edit, Trash2, Upload, TrendingUp, Users, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const STATUS_STYLES: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmé", class: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: "En attente", class: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock className="h-3 w-3" /> },
  cancelled: { label: "Annulé", class: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="h-3 w-3" /> },
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
  property_title: string
  check_in: string
  check_out: string
  total_price: number
  status: string
}

interface HostStats {
  totalRevenue: number
  activeBookings: number
  averageRating: number
  totalProperties: number
}

export default function HostDashboard() {
  const { t } = useI18n()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not host
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "host" && user.role !== "admin"))) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch host properties
  const { data: propertiesData } = useSWR<{ properties: Property[] }>(
    user?.role === "host" || user?.role === "admin" ? `/api/host/properties` : null,
    fetcher
  )

  // Fetch host bookings
  const { data: bookingsData } = useSWR<{ bookings: Booking[] }>(
    user?.role === "host" || user?.role === "admin" ? `/api/host/bookings` : null,
    fetcher
  )

  // Fetch host stats
  const { data: statsData } = useSWR<HostStats>(
    user?.role === "host" || user?.role === "admin" ? `/api/host/stats` : null,
    fetcher
  )

  if (authLoading || !user || (user.role !== "host" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hostListings = propertiesData?.properties || []
  const bookings = bookingsData?.bookings || []
  const stats = statsData || { totalRevenue: 0, activeBookings: 0, averageRating: 0, totalProperties: 0 }

  const statsList = [
    { label: "Revenus ce mois", value: `${stats.totalRevenue.toLocaleString()} DA`, icon: <DollarSign className="h-5 w-5" />, trend: "", color: "text-primary" },
    { label: "Réservations actives", value: stats.activeBookings.toString(), icon: <Calendar className="h-5 w-5" />, trend: "", color: "text-accent" },
    { label: "Note moyenne", value: stats.averageRating.toFixed(1), icon: <Star className="h-5 w-5" />, trend: "", color: "text-gold" },
    { label: "Annonces actives", value: stats.totalProperties.toString(), icon: <Home className="h-5 w-5" />, trend: "", color: "text-foreground" },
  ]

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("host_dashboard")}</h1>
            <p className="text-muted-foreground text-sm mt-1">Bonjour, {user.full_name} ! Voici un aperçu de votre activité.</p>
          </div>
          <Link href="/host/new-listing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_add_listing")}</span>
            </Button>
          </Link>
        </div>

        {/* Verification Banner */}
        {user.verification_status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-6">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Vérification en cours</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Vos documents sont en cours d&apos;examen par l&apos;administration. Votre compte sera validé sous 48h.
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 shrink-0 gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              {t("host_upload_doc")}
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsList.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <span className="text-xs text-muted-foreground">{s.trend}</span>
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
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_reservations")}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t("host_documents")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart Placeholder */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Revenus mensuels</h3>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-3">
                  {stats.totalRevenue > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ce mois</span>
                        <span className="font-medium text-foreground">{stats.totalRevenue.toLocaleString()} DA</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune réservation pour le moment
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Réservations récentes</h3>
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.slice(0, 3).map((b) => {
                      const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending
                      return (
                        <div key={b.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-secondary">{b.guest_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{b.guest_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(b.check_in).toLocaleDateString("fr-FR")} - {new Date(b.check_out).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{b.total_price.toLocaleString()} DA</p>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${s.class}`}>
                              {s.icon}
                              {s.label}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune réservation pour le moment
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <div className="space-y-4">
              {hostListings.length > 0 ? (
                hostListings.map((p) => (
                  <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image src={p.image || "/images/property-1.jpg"} alt={p.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">{p.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.location}, {p.wilaya}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        <span className="text-xs font-medium">{p.rating}</span>
                        <span className="text-xs text-muted-foreground">({p.reviewCount} avis)</span>
                        <span className="text-muted-foreground">.</span>
                        <span className="text-xs font-semibold text-primary">{p.price.toLocaleString()} DA / nuit</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={p.status === "active" ? "bg-green-100 text-green-700 border-green-200 text-xs" : "bg-amber-100 text-amber-700 border-amber-200 text-xs"}>
                        {p.status === "active" ? "Active" : "En attente"}
                      </Badge>
                      <Link href={`/listing/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore d&apos;annonces</p>
                </div>
              )}

              <Link href="/host/new-listing">
                <button className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">{t("host_add_listing")}</span>
                </button>
              </Link>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Voyageur</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Logement</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Dates</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Montant</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length > 0 ? (
                      bookings.map((b) => {
                        const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending
                        return (
                          <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-xs bg-secondary">{b.guest_name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{b.guest_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-muted-foreground hidden sm:table-cell">{b.property_title}</td>
                            <td className="px-4 py-4 text-muted-foreground hidden md:table-cell">
                              {new Date(b.check_in).toLocaleDateString("fr-FR")} - {new Date(b.check_out).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-4 py-4 text-right font-semibold text-foreground">{b.total_price.toLocaleString()} DA</td>
                            <td className="px-4 py-4 text-right">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${s.class}`}>
                                {s.icon}
                                {s.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          Aucune réservation pour le moment
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="bg-card border border-border rounded-xl p-6 max-w-lg">
              <h3 className="font-semibold text-foreground mb-2">{t("host_documents")}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Téléchargez vos documents de propriété pour valider votre compte hôte.
              </p>
              <div className="space-y-3">
                {[
                  { name: "Acte de propriété", status: user.is_verified ? "uploaded" : "pending" },
                  { name: "Pièce d'identité", status: "pending" },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{doc.name}</span>
                    </div>
                    {doc.status === "uploaded" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
                        <CheckCircle className="h-3 w-3" /> Téléchargé
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <Upload className="h-3 w-3" /> Ajouter
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>Statut :</strong> {user.verification_status === "approved" ? "Vérifié" : t("host_pending")} - {user.verification_status === "approved" ? "Votre compte est vérifié." : "Vos documents sont en cours de vérification par l'administrateur."}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
