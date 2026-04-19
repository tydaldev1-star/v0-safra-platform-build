"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { Calendar, MapPin, Users, ChevronRight, Loader2, Home, XCircle, CheckCircle, Clock, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Booking {
  id: number
  property_id: number
  property_title: string
  property_city: string
  wilaya_name: string
  property_image: string | null
  check_in: string
  check_out: string
  guests_count: number
  total_price: number
  service_fee: number
  payment_status: string
  status: string
  created_at: string
  host_name: string
  host_phone: string
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending:   { label: "En attente",  icon: <Clock className="h-3 w-3" />,        className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmée",   icon: <CheckCircle className="h-3 w-3" />,  className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Annulée",     icon: <XCircle className="h-3 w-3" />,      className: "bg-red-100 text-red-700 border-red-200" },
  completed: { label: "Terminée",    icon: <CheckCircle className="h-3 w-3" />,  className: "bg-secondary text-muted-foreground border-border" },
  rejected:  { label: "Refusée",     icon: <Ban className="h-3 w-3" />,          className: "bg-red-100 text-red-700 border-red-200" },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function nights(checkIn: string, checkOut: string) {
  return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
}

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [cancelError, setCancelError] = useState("")

  const { data, mutate, isLoading } = useSWR<{ bookings: Booking[] }>(
    user ? "/api/bookings?role=guest" : null,
    fetcher
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!user) {
    router.replace("/login")
    return null
  }

  const bookings = data?.bookings || []
  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.status !== "rejected" && new Date(b.check_out) >= new Date())
  const past = bookings.filter((b) => b.status === "completed" || new Date(b.check_out) < new Date())
  const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "rejected")

  async function handleCancel(bookingId: number) {
    setCancelling(bookingId)
    setCancelError("")
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      const json = await res.json()
      if (!res.ok) {
        setCancelError(json.error || "Erreur lors de l'annulation.")
        return
      }
      mutate()
    } catch {
      setCancelError("Erreur réseau.")
    } finally {
      setCancelling(null)
    }
  }

  function BookingCard({ booking }: { booking: Booking }) {
    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
    const n = nights(booking.check_in, booking.check_out)
    const canCancel = booking.status === "pending" && new Date(booking.check_in) > new Date()

    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-secondary">
            {booking.property_image ? (
              <Image src={booking.property_image} alt={booking.property_title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <Link href={`/listing/${booking.property_id}`} className="font-semibold text-foreground hover:text-primary transition-colors text-balance line-clamp-1">
                  {booking.property_title}
                </Link>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {booking.property_city}{booking.wilaya_name ? `, ${booking.wilaya_name}` : ""}
                </div>
              </div>
              <Badge className={`gap-1 text-xs shrink-0 ${status.className}`}>
                {status.icon} {status.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground/70">Arrivée</p>
                  <p className="font-medium text-foreground">{formatDate(booking.check_in)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground/70">Départ</p>
                  <p className="font-medium text-foreground">{formatDate(booking.check_out)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground/70">Voyageurs</p>
                  <p className="font-medium text-foreground">{booking.guests_count}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground">{n} nuit{n > 1 ? "s" : ""} · Total </span>
                <span className="font-bold text-foreground">{Number(booking.total_price).toLocaleString()} DA</span>
              </div>
              <div className="flex items-center gap-2">
                {canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    disabled={cancelling === booking.id}
                    onClick={() => handleCancel(booking.id)}
                  >
                    {cancelling === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Annuler"}
                  </Button>
                )}
                <Link href={`/listing/${booking.property_id}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                    Voir l&apos;annonce <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function EmptyState({ label }: { label: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-1">{label}</p>
        <p className="text-sm text-muted-foreground mb-5">Explorez nos logements pour planifier votre prochain séjour.</p>
        <Link href="/search">
          <Button className="bg-primary text-primary-foreground">Trouver un logement</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-6">Mes réservations</h1>

        {cancelError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive mb-4 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" /> {cancelError}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6 bg-secondary">
              <TabsTrigger value="upcoming" className="gap-2">
                À venir
                {upcoming.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {upcoming.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">Passées</TabsTrigger>
              <TabsTrigger value="cancelled">Annulées</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcoming.length === 0 ? (
                <EmptyState label="Aucune réservation à venir" />
              ) : (
                <div className="space-y-4">
                  {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {past.length === 0 ? (
                <EmptyState label="Aucune réservation passée" />
              ) : (
                <div className="space-y-4">
                  {past.map((b) => <BookingCard key={b.id} booking={b} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled">
              {cancelled.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground text-sm">Aucune réservation annulée.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cancelled.map((b) => <BookingCard key={b.id} booking={b} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  )
}
