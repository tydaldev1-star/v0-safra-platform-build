"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import {
  Users, Home, Calendar, DollarSign, Shield, CheckCircle, XCircle, Clock,
  AlertTriangle, BarChart2, MessageSquare, Search, Eye, Ban, Trash2, TrendingUp, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const STATUS_BADGE = {
  approved: <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs"><CheckCircle className="h-3 w-3" />Vérifié</Badge>,
  pending: <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 text-xs"><Clock className="h-3 w-3" />En attente</Badge>,
  rejected: <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><XCircle className="h-3 w-3" />Refusé</Badge>,
  active: <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs"><CheckCircle className="h-3 w-3" />Active</Badge>,
  suspended: <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><Ban className="h-3 w-3" />Suspendue</Badge>,
}

interface User {
  id: number
  email: string
  full_name: string
  role: string
  verification_status: string
  created_at: string
  property_count?: number
}

interface Property {
  id: number
  title: string
  location: string
  wilaya: string
  type: string
  price: number
  status: string
  image: string
}

interface Stats {
  totalUsers: number
  totalProperties: number
  totalBookings: number
  totalRevenue: number
  pendingHosts: number
  pendingProperties: number
}

export default function AdminDashboard() {
  const { t } = useI18n()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [search, setSearch] = useState("")

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch data
  const { data: statsData, isLoading: statsLoading } = useSWR<Stats>(
    user?.role === "admin" ? "/api/admin/stats" : null,
    fetcher
  )

  const { data: usersData, mutate: mutateUsers } = useSWR<{ users: User[] }>(
    user?.role === "admin" ? "/api/admin/users" : null,
    fetcher
  )

  const { data: propertiesData, mutate: mutateProperties } = useSWR<{ properties: Property[] }>(
    user?.role === "admin" ? "/api/properties?limit=100" : null,
    fetcher
  )

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = statsData ?? { totalUsers: 0, totalProperties: 0, totalBookings: 0, totalRevenue: 0, pendingHosts: 0, pendingProperties: 0 }
  const hosts = usersData?.users?.filter((u: { role: string }) => u.role === "host") || []
  const properties = propertiesData?.properties || []

  const globalStats = [
    { label: "Utilisateurs totaux", value: String(stats.totalUsers ?? 0), icon: <Users className="h-5 w-5" />, change: "", color: "text-accent" },
    { label: "Annonces actives", value: String(stats.totalProperties ?? 0), icon: <Home className="h-5 w-5" />, change: `${stats.pendingProperties ?? 0} en attente`, color: "text-primary" },
    { label: "Réservations totales", value: String(stats.totalBookings ?? 0), icon: <Calendar className="h-5 w-5" />, change: "", color: "text-foreground" },
    { label: "Revenus plateforme", value: `${((stats.totalRevenue ?? 0) / 1000).toFixed(0)}k DA`, icon: <DollarSign className="h-5 w-5" />, change: "10% commission", color: "text-gold" },
  ]

  const handleValidateHost = async (userId: number, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_status: status }),
      })
      mutateUsers()
    } catch (err) {
      console.error("Failed to update user status:", err)
    }
  }

  const handlePropertyStatus = async (propertyId: number, status: "active" | "suspended") => {
    try {
      await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      mutateProperties()
    } catch (err) {
      console.error("Failed to update property:", err)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("admin_dashboard")}</h1>
            </div>
            <p className="text-muted-foreground text-sm">Panneau de contrôle - Safra</p>
          </div>
          <div className="flex items-center gap-2">
            {stats.pendingHosts > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {stats.pendingHosts} hôtes en attente
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {globalStats.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              {s.change && <p className="text-xs text-primary mt-0.5 font-medium">{s.change}</p>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-secondary/50 border border-border flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="hosts" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Hôtes</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_listings")}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_payments")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Actions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Actions requises
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Hôtes en attente de validation", count: stats.pendingHosts, color: "bg-amber-500" },
                    { label: "Annonces à approuver", count: stats.pendingProperties, color: "bg-primary" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform breakdown */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Répartition des logements</h3>
                <div className="space-y-3">
                  {(() => {
                    const types = properties.reduce((acc, p) => {
                      acc[p.type] = (acc[p.type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                    const total = properties.length || 1
                    return Object.entries(types).slice(0, 4).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{type}</span>
                          <span className="font-medium text-foreground">{count}</span>
                        </div>
                        <Progress value={(count / total) * 100} className="h-2" />
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Hosts Tab */}
          <TabsContent value="hosts">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un hôte..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hôte</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Email</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Annonces</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hosts
                      .filter((h) => !search || h.full_name.toLowerCase().includes(search.toLowerCase()))
                      .map((h) => (
                        <tr key={h.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-secondary">{h.full_name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{h.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(h.created_at).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground hidden sm:table-cell">{h.email}</td>
                          <td className="px-4 py-4 text-center text-foreground hidden md:table-cell">{h.property_count || 0}</td>
                          <td className="px-4 py-4 text-center">
                            {STATUS_BADGE[h.verification_status as keyof typeof STATUS_BADGE] || STATUS_BADGE.pending}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {h.verification_status === "pending" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                                    onClick={() => handleValidateHost(h.id, "approved")}
                                  >
                                    <CheckCircle className="h-3 w-3" /> {t("admin_validate")}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                    onClick={() => handleValidateHost(h.id, "rejected")}
                                  >
                                    <XCircle className="h-3 w-3" /> {t("admin_reject")}
                                  </Button>
                                </>
                              )}
                              {h.verification_status === "approved" && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                  onClick={() => handleValidateHost(h.id, "rejected")}
                                >
                                  <Ban className="h-3 w-3" /> {t("admin_suspend")}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <div className="space-y-3">
              {properties.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image src={p.image || "/images/property-1.jpg"} alt={p.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{p.title}</h4>
                    <p className="text-xs text-muted-foreground">{p.location}, {p.wilaya} . {p.type}</p>
                    <p className="text-xs font-semibold text-primary mt-1">{p.price.toLocaleString()} DA / nuit</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {STATUS_BADGE[p.status as keyof typeof STATUS_BADGE] || STATUS_BADGE.pending}
                    {p.status === "active" ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs border-red-200 text-red-600 gap-1"
                        onClick={() => handlePropertyStatus(p.id, "suspended")}
                      >
                        <Ban className="h-3 w-3" /> Suspendre
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs border-green-200 text-green-600 gap-1"
                        onClick={() => handlePropertyStatus(p.id, "active")}
                      >
                        <CheckCircle className="h-3 w-3" /> Activer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Aucune annonce trouvée
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Revenus totaux", value: `${(stats.totalRevenue ?? 0).toLocaleString()} DA`, sub: "Depuis le lancement" },
                { label: "Commissions collectées", value: `${Math.round((stats.totalRevenue ?? 0) * 0.1).toLocaleString()} DA`, sub: "10% par réservation" },
                { label: "Réservations", value: String(stats.totalBookings ?? 0), sub: "Total" },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-primary mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Informations de paiement</h3>
              <p className="text-sm text-muted-foreground">
                Les transactions détaillées seront affichées ici une fois que des réservations seront effectuées.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
