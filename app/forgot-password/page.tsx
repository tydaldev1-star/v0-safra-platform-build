"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(t("auth_error"))
        setIsLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError(t("auth_error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/">
              <Image
                src="/images/safra-logo.png"
                alt="Safra"
                width={120}
                height={44}
                className="h-10 object-contain"
                style={{ width: "auto" }}
              />
            </Link>
            <LanguageSwitcher />
          </div>

          {!sent ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </Link>

              <h1 className="text-2xl font-bold text-foreground mb-1">Mot de passe oublié ?</h1>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">{t("auth_email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Envoyer le lien de réinitialisation
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Email envoyé !</h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Si un compte est associé à <span className="font-medium text-foreground">{email}</span>,
                vous recevrez un email avec les instructions de réinitialisation dans quelques minutes.
              </p>
              <p className="text-muted-foreground text-xs mb-8">
                Pensez à vérifier votre dossier spam si vous ne trouvez pas l&apos;email.
              </p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right – Image */}
      <div className="hidden lg:block flex-1 relative">
        <Image
          src="/images/hero-bg.jpg"
          alt="Safra"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy-dark/60 flex items-end p-12">
          <div>
            <p className="text-white text-3xl font-bold mb-2 text-balance">
              {t("hero_title")}
            </p>
            <p className="text-white/70 text-sm">{t("hero_subtitle")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
