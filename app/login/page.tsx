"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function LoginPage() {
  const { t } = useI18n()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">Safra</span>
            </Link>
            <LanguageSwitcher />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">{t("auth_login_title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Bienvenue sur Safra. Connectez-vous pour continuer.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {t("auth_login_btn")}
            </Button>
          </form>

          <Separator className="my-6" />

          {/* Demo Quick Access */}
          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground mb-3">Accès rapide (démo)</p>
            <Link href="/host">
              <Button variant="outline" size="sm" className="w-full text-xs h-9">
                Connexion en tant qu&apos;hôte
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="w-full text-xs h-9 border-accent text-accent hover:bg-accent/10">
                Connexion administrateur
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
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
        <div className="absolute inset-0 bg-foreground/40 flex items-end p-12">
          <div>
            <p className="text-white text-3xl font-bold mb-2 text-balance">
              Découvrez l&apos;Algérie autrement
            </p>
            <p className="text-white/70 text-sm">
              Des logements uniques pour des séjours inoubliables
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
