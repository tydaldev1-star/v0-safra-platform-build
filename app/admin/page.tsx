"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Users, Home, Calendar, DollarSign, Shield, CheckCircle, XCircle, Clock,
  AlertTriangle, BarChart2, MessageSquare, Search, Eye, Ban, Trash2, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n-context"
import { MOCK_PROPERTIES } from "@/lib/mock-data"

const MOCK_HOSTS = [
  { id: "h1", name: "Ahmed K.", email: "ahmed@email.com", listings: 3, status: "verified", joinDate: "Nov 2024" },
  { id: "h2", name: "Fatima Z.", email: "fatima@email.com", listings: 1, status: "pending", joinDate: "Jan 2025" },
  { id: "h3", name: "Yacine M.", email: "yacine@email.com", listings: 2, status: "pending", joinDate: "Jan 2025" },
  { id: "h4", name: "Nadia B.", email: "nadia@email.com", listings: 1, status: "rejected", joinDate: "Dec 2024" },
]

const MOCK_MESSAGES = [
  { id: "m1", from: "Amira B. (Client)", to: "Ahmed K. (Hôte)", subject: "Question sur le logement", date: "19/01/2025", status: "pending" },
  { id: "m2", from: "Karim D. (Client)", to: "Fatima Z. (Hôte)", subject: "Problème lors du séjour", date: "18/01/2025", status: "resolved" },
  { id: "m3", from: "Omar S. (Client)", to: "Yacine M. (Hôte)", subject: "Demande d'informations", date: "17/01/2025", status: "pending" },
]

const STATUS_BADGE = {
  verified: <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs"><CheckCircle className="h-3 w-3" />Vérifié</Badge>,
  pending: <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 text-xs"><Clock className="h-3 w-3" />En attente</Badge>,
  rejected: <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><XCircle className="h-3 w-3" />Refusé</Badge>,
  active: <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-xs"><CheckCircle className="h-3 w-3" />Active</Badge>,
  suspended: <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 text-xs"><Ban className="h-3 w-3" />Suspendue</Badge>,
}

export default function AdminDashboard() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("overview")
  const [search, setSearch] = useState("")

  const globalStats = [
    { label: "Utilisateurs totaux", value: "1 247", icon: <Users className="h-5 w-5" />, change: "+38 ce mois", color: "text-accent" },
    { label: "Annonces actives", value: "312", icon: <Home className="h-5 w-5" />, change: "+14 en attente", color: "text-primary" },
    { label: "Réservations totales", value: "4 861", icon: <Calendar className="h-5 w-5" />, change: "+127 ce mois", color: "text-foreground" },
    { label: "Revenus plateforme", value: "2.4M DA", icon: <DollarSign className="h-5 w-5" />, change: "+8.3%", color: "text-gold" },
  ]

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar userRole="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("admin_dashboard")}</h1>
            </div>
            <p className="text-muted-foreground text-sm">Panneau de contrôle — Safra</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              3 actions requises
            </Badge>
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
              <p className="text-xs text-primary mt-0.5 font-medium">{s.change}</p>
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
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_messages")}</span>
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
                    { label: "Hôtes en attente de validation", count: 2, color: "bg-amber-500" },
                    { label: "Annonces à approuver", count: 5, color: "bg-primary" },
                    { label: "Messages non traités", count: 3, color: "bg-accent" },
                    { label: "Litiges ouverts", count: 1, color: "bg-red-500" },
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
                  {[
                    { type: "Appartements", count: 142, pct: 45 },
                    { type: "Villas", count: 89, pct: 28 },
                    { type: "Chalets", count: 47, pct: 15 },
                    { type: "Studios", count: 34, pct: 12 },
                  ].map((item) => (
                    <div key={item.type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="font-medium text-foreground">{item.count}</span>
                      </div>
                      <Progress value={item.pct} className="h-2" />
                    </div>
                  ))}
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
                    {MOCK_HOSTS.filter((h) => !search || h.name.toLowerCase().includes(search.toLowerCase())).map((h) => (
                      <tr key={h.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-secondary">{h.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{h.name}</p>
                              <p className="text-xs text-muted-foreground">{h.joinDate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground hidden sm:table-cell">{h.email}</td>
                        <td className="px-4 py-4 text-center text-foreground hidden md:table-cell">{h.listings}</td>
                        <td className="px-4 py-4 text-center">{STATUS_BADGE[h.status as keyof typeof STATUS_BADGE]}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {h.status === "pending" && (
                              <>
                                <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1">
                                  <CheckCircle className="h-3 w-3" /> {t("admin_validate")}
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1">
                                  <XCircle className="h-3 w-3" /> {t("admin_reject")}
                                </Button>
                              </>
                            )}
                            {h.status === "verified" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 gap-1">
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
              {MOCK_PROPERTIES.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image src={p.image} alt={p.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{p.title}</h4>
                    <p className="text-xs text-muted-foreground">{p.location}, {p.wilaya} · {p.type}</p>
                    <p className="text-xs font-semibold text-primary mt-1">{p.price.toLocaleString()} DA / nuit</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {STATUS_BADGE.active}
                    <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 gap-1">
                      <Trash2 className="h-3 w-3" /> Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Centre de messagerie</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  En tant qu&apos;intermédiaire unique, vous gérez toutes les communications entre clients et hôtes.
                </p>
              </div>
              <div className="divide-y divide-border">
                {MOCK_MESSAGES.map((msg) => (
                  <div key={msg.id} className="p-4 flex items-start justify-between hover:bg-secondary/20">
                    <div className="flex gap-3">
                      <MessageSquare className={`h-5 w-5 mt-0.5 shrink-0 ${msg.status === "pending" ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{msg.from} → {msg.to}</p>
                        <p className="text-xs text-muted-foreground">{msg.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {msg.status === "pending" ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Non traité</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Résolu</Badge>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <Eye className="h-3 w-3" /> Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Revenus totaux", value: "2 415 000 DA", sub: "Depuis le lancement" },
                { label: "Commissions collectées", value: "241 500 DA", sub: "10% par réservation" },
                { label: "Transactions ce mois", value: "127", sub: "Janvier 2025" },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-primary mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Transactions récentes</h3>
              <div className="space-y-3">
                {[
                  { ref: "TXN-4821", guest: "Amira B.", amount: 42500, commission: 4250, date: "19/01/2025", method: "CIB" },
                  { ref: "TXN-4820", guest: "Karim D.", amount: 25500, commission: 2550, date: "17/01/2025", method: "Edahabia" },
                  { ref: "TXN-4819", guest: "Yasmine M.", amount: 13500, commission: 1350, date: "15/01/2025", method: "CIB" },
                ].map((tx) => (
                  <div key={tx.ref} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.guest}</p>
                      <p className="text-xs text-muted-foreground">{tx.ref} · {tx.date} · {tx.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{tx.amount.toLocaleString()} DA</p>
                      <p className="text-xs text-primary">Commission : {tx.commission.toLocaleString()} DA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
