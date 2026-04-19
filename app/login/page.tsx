"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function LoginPage() {
  const { t } = useI18n()
  const { login, user } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    if (user.role === "admin") {
      router.push("/admin")
    } else if (user.role === "host") {
      router.push("/host")
    } else {
      router.push("/")
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (!result.success) {
        if (result.error === "invalid_credentials") {
          setError(t("auth_invalid_credentials"))
        } else {
          setError(t("auth_error"))
        }
        setIsLoading(false)
        return
      }

      // Redirect based on role will happen automatically via the useAuth hook
      router.refresh()
    } catch {
      setError(t("auth_error"))
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

          <h1 className="text-2xl font-bold text-foreground mb-1">{t("auth_login_title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            {t("auth_login_subtitle")}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div className="flex justify-end">
                <Link href="#" className="text-xs text-primary hover:underline">
                  {t("auth_forgot_password")}
                </Link>
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
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {t("auth_login_btn")}
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            {t("auth_no_account")}{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              {t("nav_register")}
            </Link>
          </p>
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
            <p className="text-white/70 text-sm">
              {t("hero_subtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
