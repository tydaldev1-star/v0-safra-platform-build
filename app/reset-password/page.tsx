"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "@/components/language-switcher"

function ResetPasswordForm() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setTokenError("Lien invalide. Veuillez refaire la demande.")
      setIsValidating(false)
      return
    }

    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true)
        } else {
          if (data.error === "token_expired") {
            setTokenError("Ce lien a expiré. Veuillez refaire la demande.")
          } else if (data.error === "token_used") {
            setTokenError("Ce lien a déjà été utilisé.")
          } else {
            setTokenError("Lien invalide. Veuillez refaire la demande.")
          }
        }
      })
      .catch(() => setTokenError("Une erreur est survenue."))
      .finally(() => setIsValidating(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError(t("auth_password_too_short"))
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "token_expired") {
          setError("Ce lien a expiré. Veuillez refaire la demande.")
        } else if (data.error === "password_too_short") {
          setError(t("auth_password_too_short"))
        } else {
          setError(t("auth_error"))
        }
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch {
      setError(t("auth_error"))
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (isValidating) {
      return (
        <div className="flex flex-col items-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validation du lien...</p>
        </div>
      )
    }

    if (!tokenValid) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Lien invalide</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{tokenError}</p>
          <Link href="/forgot-password">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              Nouvelle demande de réinitialisation
            </Button>
          </Link>
        </div>
      )
    }

    if (success) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Mot de passe modifié !</h2>
          <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <p className="text-muted-foreground text-xs mb-6">Redirection vers la connexion...</p>
          <Link href="/login">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              Se connecter maintenant
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <>
        <h1 className="text-2xl font-bold text-foreground mb-1">Nouveau mot de passe</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm font-medium">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
              <Lock className="h-4 w-4 mr-2" />
            )}
            Réinitialiser le mot de passe
          </Button>
        </form>
      </>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
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
          {renderContent()}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
