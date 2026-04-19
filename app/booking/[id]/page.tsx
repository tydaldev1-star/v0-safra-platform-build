"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ChevronLeft, Star, Shield, CheckCircle, CreditCard, Smartphone, Calendar, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { useI18n } from "@/lib/i18n-context"
import { MOCK_PROPERTIES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type PaymentMethod = "cib" | "edahabia"
type BookingStep = "details" | "payment" | "confirmation"

export default function BookingPage() {
  const { t } = useI18n()
  const params = useParams()
  const property = MOCK_PROPERTIES.find((p) => p.id === params.id) || MOCK_PROPERTIES[0]

  const [step, setStep] = useState<BookingStep>("details")
  const [checkIn, setCheckIn] = useState("2025-02-10")
  const [checkOut, setCheckOut] = useState("2025-02-15")
  const [guests, setGuests] = useState(2)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cib")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")

  const nights = Math.max(
    0,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  )
  const subtotal = nights * property.price
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + serviceFee

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back */}
        <Link
          href={`/listing/${property.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("back")}
        </Link>

        {step !== "confirmation" && (
          <h1 className="text-2xl font-bold text-foreground mb-6">{t("booking_confirm")}</h1>
        )}

        {/* Steps Indicator */}
        {step !== "confirmation" && (
          <div className="flex items-center gap-2 mb-8">
            {(["details", "payment"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    step === s || (step === "payment" && s === "details")
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {step === "payment" && s === "details" ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("text-sm", step === s ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {s === "details" ? "Détails du séjour" : "Paiement"}
                </span>
                {i < 1 && <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />}
              </div>
            ))}
          </div>
        )}

        {/* Confirmation */}
        {step === "confirmation" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("booking_success")}</h1>
            <p className="text-muted-foreground max-w-sm mb-6">
              Votre réservation a été confirmée. Un email de confirmation a été envoyé à votre adresse.
            </p>
            <div className="bg-card border border-border rounded-xl p-5 w-full max-w-sm text-left mb-6 space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">Logement :</span> <span className="font-medium text-foreground">{property.title}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Arrivée :</span> <span className="font-medium text-foreground">{new Date(checkIn).toLocaleDateString("fr-FR")}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Départ :</span> <span className="font-medium text-foreground">{new Date(checkOut).toLocaleDateString("fr-FR")}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Total :</span> <span className="font-bold text-primary">{total.toLocaleString()} DA</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Réf. :</span> <span className="font-mono text-xs text-foreground">SAF-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span></p>
            </div>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        )}

        {step !== "confirmation" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left */}
            <div className="lg:col-span-3 space-y-6">
              {/* Step 1 – Details */}
              {step === "details" && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <h2 className="font-semibold text-foreground text-lg">Détails de votre séjour</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                        {t("booking_checkin")}
                      </label>
                      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="text-sm text-foreground bg-transparent w-full outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                        {t("booking_checkout")}
                      </label>
                      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="text-sm text-foreground bg-transparent w-full outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                      {t("booking_guests")}
                    </label>
                    <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="text-sm text-foreground bg-transparent w-full outline-none"
                      >
                        {Array.from({ length: property.guests }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? t("guest") : t("guests")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm font-semibold text-foreground mb-1">Règles d&apos;annulation</p>
                    <p className="text-xs text-muted-foreground">
                      Annulation gratuite jusqu&apos;à 48h avant l&apos;arrivée. Après ce délai, la première nuit est non remboursable.
                    </p>
                  </div>

                  <Button
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={() => setStep("payment")}
                    disabled={nights === 0}
                  >
                    Continuer vers le paiement
                  </Button>
                </div>
              )}

              {/* Step 2 – Payment */}
              {step === "payment" && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <h2 className="font-semibold text-foreground text-lg">Paiement sécurisé</h2>

                  {/* Payment method */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Méthode de paiement</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["cib", "edahabia"] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all",
                            paymentMethod === method
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {method === "cib" ? (
                            <CreditCard className="h-5 w-5 text-primary shrink-0" />
                          ) : (
                            <Smartphone className="h-5 w-5 text-accent shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {method === "cib" ? "Carte CIB" : "Edahabia"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {method === "cib" ? "Carte bancaire algérienne" : "Carte postale Algérie Poste"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                        Numéro de carte
                      </label>
                      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2.5">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 16)
                            setCardNumber(v.replace(/(.{4})/g, "$1 ").trim())
                          }}
                          className="text-sm text-foreground bg-transparent w-full outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                          Expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="•••"
                          maxLength={3}
                          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/30 rounded-lg">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    Paiement 100% sécurisé via SATIM. Vos données bancaires sont chiffrées et protégées.
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                      {t("back")}
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                      onClick={() => setStep("confirmation")}
                    >
                      Payer {total.toLocaleString()} DA
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right – Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <Image src={property.image} alt={property.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{property.type}</p>
                    <h3 className="font-semibold text-foreground text-sm mt-0.5 line-clamp-2">{property.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <span className="text-xs font-medium">{property.rating}</span>
                      <span className="text-xs text-muted-foreground">({property.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("booking_summary")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {property.price.toLocaleString()} DA × {nights} {nights === 1 ? t("night") : t("nights")}
                      </span>
                      <span className="text-foreground">{subtotal.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("booking_service_fee")}</span>
                      <span className="text-foreground">{serviceFee.toLocaleString()} DA</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-foreground">
                      <span>{t("booking_total")}</span>
                      <span>{total.toLocaleString()} DA</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                  {t("booking_not_charged")}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
