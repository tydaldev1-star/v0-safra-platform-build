"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import useSWR from "swr"
import {
  Users, Home, Calendar, DollarSign, Shield, CheckCircle, XCircle, Clock,
  AlertTriangle, BarChart2, Search, Ban, Trash2, TrendingUp, Loader2,
  FileText, Eye, ExternalLink, UserCheck, ChevronDown, ChevronUp, Phone, Mail,
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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const VERIFY_BADGE: Record<string, React.ReactNode> = {
  approved: <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs"><CheckCircle className="h-3 w-3" />Vérifié</Badge>,
  pending:  <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 text-xs"><Clock className="h-3 w-3" />En attente</Badge>,
  rejected: <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><XCircle className="h-3 w-3" />Refusé</Badge>,
}

const PROP_BADGE: Record<string, React.ReactNode> = {
  active:    <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs"><CheckCircle className="h-3 w-3" />Active</Badge>,
  pending:   <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 text-xs"><Clock className="h-3 w-3" />En attente</Badge>,
  rejected:  <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><XCircle className="h-3 w-3" />Refusée</Badge>,
  suspended: <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><Ban className="h-3 w-3" />Suspendue</Badge>,
  inactive:  <Badge className="bg-secondary text-muted-foreground border-border gap-1 text-xs"><Clock className="h-3 w-3" />Inactive</Badge>,
  draft:     <Badge className="bg-secondary text-muted-foreground border-border gap-1 text-xs">Brouillon</Badge>,
}

interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: string
  verification_status: string
  id_document_url: string | null
  is_verified: boolean
  created_at: string
  properties_count: number
  bookings_count: number
}

interface Property {
  id: number
  title: string
  location: string
  wilaya: string
  type: string
  price: number
  status: string
  image: string | null
  host_name: string
  host_email: string
  host_status: string
  avg_rating: string
  review_count: number
  booking_count: number
  is_featured: boolean
  created_at: string
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
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [actionMsg, setActionMsg] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Redirect if not admin
  React.useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const { data: statsData } = useSWR<Stats>(
    user?.role === "admin" ? "/api/admin/stats" : null, fetcher
  )
  const { data: usersData, mutate: mutateUsers } = useSWR<{ users: User[] }>(
    user?.role === "admin" ? "/api/admin/users" : null, fetcher
  )
  const { data: propertiesData, mutate: mutateProperties } = useSWR<{ properties: Property[] }>(
    user?.role === "admin" ? `/api/admin/properties${search && activeTab === "listings" ? `?search=${encodeURIComponent(search)}` : ""}` : null,
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
  const allUsers = usersData?.users || []
  const hosts = allUsers.filter((u) => u.role === "host")
  const clients = allUsers.filter((u) => u.role === "guest")
  const properties = propertiesData?.properties || []

  // Hosts with pending documents
  const pendingDocHosts = hosts.filter((h) => h.id_document_url && h.verification_status === "pending")

  function formatAmount(val: number): string {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M DA`
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k DA`
    return `${val.toLocaleString("fr-DZ")} DA`
  }

  const globalStats = [
    { label: "Utilisateurs", value: String(stats.totalUsers || 0), icon: <Users className="h-5 w-5" />, sub: `${clients.length} clients · ${hosts.length} hôtes`, color: "text-accent" },
    { label: "Annonces", value: String(stats.totalProperties || 0), icon: <Home className="h-5 w-5" />, sub: `${stats.pendingProperties || 0} en attente`, color: "text-primary" },
    { label: "Réservations", value: String(stats.totalBookings || 0), icon: <Calendar className="h-5 w-5" />, sub: `${stats.pendingHosts || 0} hôtes en attente`, color: "text-foreground" },
    { label: "Revenus (10%)", value: formatAmount(stats.totalRevenue ?? 0), icon: <DollarSign className="h-5 w-5" />, sub: "Commission plateforme", color: "text-gold" },
  ]

  async function handleUserAction(userId: number, payload: object) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    mutateUsers()
  }

  async function handleDeleteUser(userId: number) {
    if (!confirm("Supprimer cet utilisateur définitivement ?")) return
    setDeletingId(userId)
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
    mutateUsers()
    setDeletingId(null)
  }

  async function handlePropertyAction(propertyId: number, payload: object) {
    await fetch(`/api/admin/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    mutateProperties()
    setActionMsg("Mise à jour effectuée.")
    setTimeout(() => setActionMsg(""), 3000)
  }

  async function handleDeleteProperty(propertyId: number) {
    if (!confirm("Supprimer cette annonce définitivement ?")) return
    await fetch(`/api/admin/properties/${propertyId}`, { method: "DELETE" })
    mutateProperties()
  }

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("admin_dashboard")}</h1>
            </div>
            <p className="text-muted-foreground text-sm">Panneau de contrôle — Safra</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stats.pendingHosts > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {stats.pendingHosts} hôtes en attente
              </Badge>
            )}
            {stats.pendingProperties > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                <Home className="h-3.5 w-3.5" />
                {stats.pendingProperties} annonces à approuver
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
              {s.sub && <p className="text-xs text-primary mt-0.5 font-medium">{s.sub}</p>}
            </div>
          ))}
        </div>

        {actionMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-800">
            {actionMsg}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch("") }}>
          <TabsList className="mb-6 bg-secondary/50 border border-border flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <BarChart2 className="h-4 w-4" /><span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="hosts" className="gap-1.5 text-xs sm:text-sm">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Hôtes</span>
              {stats.pendingHosts > 0 && <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{stats.pendingHosts}</span>}
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4" /><span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-1.5 text-xs sm:text-sm">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Annonces</span>
              {stats.pendingProperties > 0 && <span className="bg-primary text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{stats.pendingProperties}</span>}
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
              {pendingDocHosts.length > 0 && <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingDocHosts.length}</span>}
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Actions requises
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Hôtes en attente de validation", count: stats.pendingHosts, color: "bg-amber-500" },
                    { label: "Annonces à approuver", count: stats.pendingProperties, color: "bg-primary" },
                    { label: "Documents à examiner", count: pendingDocHosts.length, color: "bg-blue-500" },
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

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Répartition des logements</h3>
                <div className="space-y-3">
                  {(() => {
                    const types = properties.reduce((acc, p) => {
                      acc[p.type] = (acc[p.type] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                    const total = properties.length || 1
                    return Object.entries(types).slice(0, 5).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{type}</span>
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

          {/* ── Hosts ── */}
          <TabsContent value="hosts">
            <UserTable
              users={hosts}
              search={search}
              setSearch={setSearch}
              expandedUser={expandedUser}
              setExpandedUser={setExpandedUser}
              deletingId={deletingId}
              onVerify={(id, status) => handleUserAction(id, { verification_status: status, is_verified: status === "approved" })}
              onDelete={handleDeleteUser}
              onSuspend={(id) => handleUserAction(id, { verification_status: "rejected" })}
              isHost
            />
          </TabsContent>

          {/* ── Clients ── */}
          <TabsContent value="clients">
            <UserTable
              users={clients}
              search={search}
              setSearch={setSearch}
              expandedUser={expandedUser}
              setExpandedUser={setExpandedUser}
              deletingId={deletingId}
              onVerify={(id, status) => handleUserAction(id, { verification_status: status })}
              onDelete={handleDeleteUser}
              onSuspend={(id) => handleUserAction(id, { verification_status: "rejected" })}
              isHost={false}
            />
          </TabsContent>

          {/* ── Listings ── */}
          <TabsContent value="listings">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une annonce, un hôte, une wilaya..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{properties.length} annonce{properties.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-border">
                {(() => {
                  const filtered = properties.filter((p) =>
                    !search ||
                    p.title?.toLowerCase().includes(search.toLowerCase()) ||
                    p.host_name?.toLowerCase().includes(search.toLowerCase()) ||
                    p.wilaya?.toLowerCase().includes(search.toLowerCase())
                  )
                  if (filtered.length === 0) {
                    return <div className="text-center py-12 text-muted-foreground text-sm">Aucune annonce trouvée</div>
                  }
                  return filtered.map((p) => (
                    <div key={p.id} className="p-4 flex items-start gap-4 hover:bg-secondary/20">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary">
                        {p.image ? (
                          <Image src={p.image} alt={p.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">{p.title || "Sans titre"}</h4>
                            <p className="text-xs text-muted-foreground">{p.location}{p.wilaya ? `, ${p.wilaya}` : ""} · {p.type}</p>
                            <p className="text-xs font-semibold text-primary mt-0.5">{Number(p.price).toLocaleString()} DA / nuit</p>
                          </div>
                          {PROP_BADGE[p.status] ?? PROP_BADGE.pending}
                        </div>
                        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                          <div className="text-xs text-muted-foreground">
                            Hôte : <span className="text-foreground font-medium">{p.host_name}</span>
                            {" · "}{new Date(p.created_at).toLocaleDateString("fr-FR")}
                            {p.booking_count > 0 && ` · ${p.booking_count} réservation(s)`}
                            {Number(p.avg_rating) > 0 && ` · ★ ${p.avg_rating}`}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {p.status === "pending" && (
                              <>
                                <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                                  onClick={() => handlePropertyAction(p.id, { status: "active" })}>
                                  <CheckCircle className="h-3 w-3" /> Approuver
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                  onClick={() => handlePropertyAction(p.id, { status: "rejected" })}>
                                  <XCircle className="h-3 w-3" /> Rejeter
                                </Button>
                              </>
                            )}
                            {p.status === "active" && (
                              <>
                                <Button
                                  size="sm" variant="outline"
                                  className={`h-7 text-xs gap-1 ${p.is_featured ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-border text-muted-foreground"}`}
                                  onClick={() => handlePropertyAction(p.id, { is_featured: !p.is_featured })}>
                                  {p.is_featured ? "En vedette" : "Mettre en vedette"}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                  onClick={() => handlePropertyAction(p.id, { status: "suspended" })}>
                                  <Ban className="h-3 w-3" /> Suspendre
                                </Button>
                              </>
                            )}
                            {(p.status === "suspended" || p.status === "rejected" || p.status === "inactive") && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 text-green-600 hover:bg-green-50 gap-1"
                                onClick={() => handlePropertyAction(p.id, { status: "active" })}>
                                <CheckCircle className="h-3 w-3" /> Réactiver
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                              onClick={() => handleDeleteProperty(p.id)}>
                              <Trash2 className="h-3 w-3" /> Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </TabsContent>

          {/* ── Documents ── */}
          <TabsContent value="documents">
            <div className="space-y-4">
              {hosts.filter((h) => h.id_document_url).length === 0 && (
                <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-sm">
                  Aucun document soumis pour le moment.
                </div>
              )}
              {hosts.filter((h) => h.id_document_url).map((h) => (
                <div key={h.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary text-sm">{h.full_name?.[0] || "H"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{h.full_name}</p>
                        <p className="text-xs text-muted-foreground">{h.email}</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {VERIFY_BADGE[h.verification_status] ?? VERIFY_BADGE.pending}
                      <a
                        href={h.id_document_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Voir document
                      </a>
                      {h.verification_status !== "approved" && (
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => handleUserAction(h.id, { verification_status: "approved", is_verified: true })}>
                          <CheckCircle className="h-3 w-3" /> Approuver
                        </Button>
                      )}
                      {h.verification_status !== "rejected" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                          onClick={() => handleUserAction(h.id, { verification_status: "rejected", is_verified: false })}>
                          <XCircle className="h-3 w-3" /> Rejeter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ── Reusable user table ──────────────────────────────────────────────────────
function UserTable({
  users, search, setSearch, expandedUser, setExpandedUser,
  deletingId, onVerify, onDelete, onSuspend, isHost,
}: {
  users: User[]
  search: string
  setSearch: (v: string) => void
  expandedUser: number | null
  setExpandedUser: (id: number | null) => void
  deletingId: number | null
  onVerify: (id: number, status: "approved" | "rejected") => void
  onDelete: (id: number) => void
  onSuspend: (id: number) => void
  isHost: boolean
}) {
  const filtered = users.filter((u) =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isHost ? "Rechercher un hôte..." : "Rechercher un client..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="divide-y divide-border">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Aucun utilisateur trouvé</div>
        )}
        {filtered.map((u) => {
          const isExpanded = expandedUser === u.id
          return (
            <div key={u.id} className="hover:bg-secondary/10">
              <div className="p-4 flex items-center gap-3 flex-wrap">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-secondary text-sm">{u.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {VERIFY_BADGE[u.verification_status] ?? VERIFY_BADGE.pending}
                  {isHost && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {u.properties_count || 0} annonce{(u.properties_count || 0) !== 1 ? "s" : ""}
                    </span>
                  )}
                  {!isHost && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {u.bookings_count || 0} réservation{(u.bookings_count || 0) !== 1 ? "s" : ""}
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 bg-secondary/10 border-t border-border">
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {u.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{u.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </div>
                    {isHost && u.id_document_url && (
                      <a
                        href={u.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Voir document d&apos;identité
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isHost && u.verification_status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => onVerify(u.id, "approved")}>
                          <CheckCircle className="h-3 w-3" /> Approuver
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                          onClick={() => onVerify(u.id, "rejected")}>
                          <XCircle className="h-3 w-3" /> Rejeter
                        </Button>
                      </>
                    )}
                    {isHost && u.verification_status === "approved" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 gap-1"
                        onClick={() => onSuspend(u.id)}>
                        <Ban className="h-3 w-3" /> Suspendre
                      </Button>
                    )}
                    {isHost && u.verification_status === "rejected" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 text-green-600 hover:bg-green-50 gap-1"
                        onClick={() => onVerify(u.id, "approved")}>
                        <UserCheck className="h-3 w-3" /> Réactiver
                      </Button>
                    )}
                    <Button
                      size="sm" variant="outline"
                      className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1"
                      disabled={deletingId === u.id}
                      onClick={() => onDelete(u.id)}>
                      {deletingId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
