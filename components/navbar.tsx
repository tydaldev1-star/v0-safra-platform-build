"use client"

import { useState } from "react"
import Image from "next/image"
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
import { Menu, X, User, Home, Shield, ChevronDown, Bell } from "lucide-react"

type UserRole = "guest" | "host" | "admin" | null

interface NavbarProps {
  userRole?: UserRole
}

export function Navbar({ userRole = null }: NavbarProps) {
  const { t, isRTL } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px] gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/images/safra-logo.png"
              alt="Safra Location de Vacances"
              width={140}
              height={52}
              className="h-11 object-contain"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 font-medium text-sm px-4"
              >
                {t("nav_home")}
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 font-medium text-sm px-4"
              >
                {t("nav_search")}
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-primary hover:bg-primary/5 font-medium text-sm px-4"
              >
                {t("footer_host")}
              </Button>
            </Link>
            {userRole === "host" && (
              <Link href="/host">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/70 hover:text-primary hover:bg-primary/5 font-medium text-sm px-4"
                >
                  {t("nav_host_dashboard")}
                </Button>
              </Link>
            )}
            {userRole === "admin" && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/70 hover:text-primary hover:bg-primary/5 font-medium text-sm px-4"
                >
                  {t("nav_admin")}
                </Button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            {userRole ? (
              <>
                <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors relative">
                  <Bell className="h-4 w-4 text-foreground/70" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-2 border border-border rounded-full px-3 py-1.5 hover:shadow-sm transition-shadow bg-white">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-foreground/60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-52 mt-1">
                    {userRole === "guest" && (
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="cursor-pointer font-medium">
                          {t("nav_my_bookings")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === "host" && (
                      <DropdownMenuItem asChild>
                        <Link href="/host" className="cursor-pointer font-medium gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          {t("nav_host_dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer font-medium gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          {t("nav_admin")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/" className="cursor-pointer text-destructive font-medium">
                        {t("nav_logout")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium text-foreground/80 hover:text-primary"
                  >
                    {t("nav_login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-5 rounded-full shadow-sm"
                  >
                    {t("nav_register")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1 bg-white">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start font-medium">
                {t("nav_home")}
              </Button>
            </Link>
            <Link href="/search" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start font-medium">
                {t("nav_search")}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start font-medium">
                {t("footer_host")}
              </Button>
            </Link>
            {!userRole && (
              <>
                <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2 px-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full font-medium">
                      {t("nav_login")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-full"
                    >
                      {t("nav_register")}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
