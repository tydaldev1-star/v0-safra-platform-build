"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, UserPlus, Home, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

type Role = "guest" | "host"

export default function RegisterPage() {
  const { t } = useI18n()
  const [role, setRole] = useState<Role>("guest")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

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
                className="h-10 w-auto object-contain"
              />
            </Link>
            <LanguageSwitcher />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">{t("auth_register_title")}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Rejoignez des milliers de voyageurs et propriétaires sur Safra.
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setRole("guest")}
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
              onClick={() => setRole("host")}
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

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">{t("auth_name")}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom complet"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">{t("auth_email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">{t("auth_phone")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+213 6XX XX XX XX"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">{t("auth_password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  required
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
                <p className="text-xs font-semibold text-accent mb-1">Documents requis pour les hôtes</p>
                <p className="text-xs text-muted-foreground">
                  Après votre inscription, vous devrez fournir un acte de propriété ou un document officiel pour valider votre compte hôte.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t("auth_register_btn")}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              En vous inscrivant, vous acceptez nos{" "}
              <Link href="#" className="text-primary hover:underline">Conditions d&apos;utilisation</Link>
              {" "}et notre{" "}
              <Link href="#" className="text-primary hover:underline">Politique de confidentialité</Link>.
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
              Partagez votre logement
            </p>
            <p className="text-white/70 text-sm">
              Rejoignez notre communauté d&apos;hôtes et générez des revenus supplémentaires
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
