"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, UserPlus, Home, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

type Role = "guest" | "host"

export default function RegisterPage() {
  const { t } = useI18n()
  const { register, user } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<Role>("guest")
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (password.length < 6) {
      setError(t("auth_password_too_short"))
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        email,
        password,
        fullName,
        phone,
        role,
      })

      if (!result.success) {
        if (result.error === "email_exists") {
          setError(t("auth_email_exists"))
        } else {
          setError(t("auth_error"))
        }
        setIsLoading(false)
        return
      }

      // Redirect based on role
      if (role === "host") {
        router.push("/host")
      } else {
        router.push("/")
      }
    } catch {
      setError(t("auth_error"))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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

          <h1 className="text-2xl font-bold text-foreground mb-1">{t("auth_register_title")}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {t("auth_register_subtitle")}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("guest")}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === "guest"
                  ? "border-accent bg-accent/8 text-accent"
                  : "border-border text-muted-foreground hover:border-muted-foreground/40"
              )}
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{t("auth_register_as_guest")}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("host")}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === "host"
                  ? "border-accent bg-accent/8 text-accent"
                  : "border-border text-muted-foreground hover:border-muted-foreground/40"
              )}
            >
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium">{t("auth_register_as_host")}</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">{t("auth_name")}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">{t("auth_email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">{t("auth_phone")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+213 6XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">{t("auth_password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                  minLength={6}
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
            </div>

            {role === "host" && (
              <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                <p className="text-xs font-semibold text-accent mb-1">{t("auth_host_docs_required")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("auth_host_docs_info")}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {t("auth_register_btn")}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("auth_terms_prefix")}{" "}
              <Link href="#" className="text-primary hover:underline">{t("auth_terms")}</Link>
              {" "}{t("auth_terms_and")}{" "}
              <Link href="#" className="text-primary hover:underline">{t("auth_privacy")}</Link>.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth_have_account")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              {t("nav_login")}
            </Link>
          </p>
        </div>
      </div>

      {/* Right – Image */}
      <div className="hidden lg:block flex-1 relative">
        <Image
          src="/images/property-2.jpg"
          alt="Safra"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy-dark/60 flex items-end p-12">
          <div>
            <p className="text-white text-3xl font-bold mb-2 text-balance">
              {t("auth_host_cta_title")}
            </p>
            <p className="text-white/70 text-sm">
              {t("auth_host_cta_subtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
