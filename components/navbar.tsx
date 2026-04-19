"use client"

import { useState } from "react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "./language-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, Home, Shield } from "lucide-react"

type UserRole = "guest" | "host" | "admin" | null

interface NavbarProps {
  userRole?: UserRole
}

export function Navbar({ userRole = null }: NavbarProps) {
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Safra</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                {t("nav_home")}
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                {t("nav_search")}
              </Button>
            </Link>
            {userRole === "host" && (
              <Link href="/host">
                <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                  {t("nav_host_dashboard")}
                </Button>
              </Link>
            )}
            {userRole === "admin" && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                  {t("nav_admin")}
                </Button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {userRole ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-border">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {userRole === "admin" ? "Admin" : userRole === "host" ? "Hôte" : "Compte"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {userRole === "guest" && (
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer">
                        {t("nav_my_bookings")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole === "host" && (
                    <DropdownMenuItem asChild>
                      <Link href="/host" className="cursor-pointer">
                        <Home className="h-4 w-4 mr-2" />
                        {t("nav_host_dashboard")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        {t("nav_admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer text-destructive">
                      {t("nav_logout")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav_login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t("nav_register")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                {t("nav_home")}
              </Button>
            </Link>
            <Link href="/search" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                {t("nav_search")}
              </Button>
            </Link>
            {!userRole && (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    {t("nav_login")}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-primary-foreground">
                    {t("nav_register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
