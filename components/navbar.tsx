"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { LanguageSwitcher } from "./language-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, Home, Shield, ChevronDown, Bell, LogOut, Search, Calendar, MapPin } from "lucide-react"

export function Navbar() {
  const { t, isRTL } = useI18n()
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const userRole = user?.role || null
  const isHome = pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const navLinkClass = (active?: boolean) =>
    `relative text-sm font-medium transition-colors duration-200 px-1 py-0.5 ${
      active
        ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary after:rounded-full"
        : "text-foreground/60 hover:text-foreground"
    }`

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "navbar-glass shadow-sm"
          : "bg-white/95 backdrop-blur-sm border-b border-border/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/images/safra-logo.png"
              alt="Safra"
              width={120}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
            <Link href="/" className={navLinkClass(pathname === "/")}>{t("nav_home")}</Link>
            <Link href="/search" className={navLinkClass(pathname === "/search")}>{t("nav_search")}</Link>
            <Link href="/register" className={navLinkClass(false)}>{t("footer_host")}</Link>
            {userRole === "host" && (
              <Link href="/host" className={navLinkClass(pathname === "/host")}>{t("nav_host_dashboard")}</Link>
            )}
            {userRole === "admin" && (
              <Link href="/admin" className={navLinkClass(pathname === "/admin")}>{t("nav_admin")}</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {userRole ? (
              <div className="hidden md:flex items-center gap-1">
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-secondary transition-all duration-200 relative">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full ring-2 ring-background" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 border border-border rounded-full pl-2.5 pr-3 py-1.5 hover:bg-secondary transition-all duration-200 ml-1">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground uppercase">
                          {user?.full_name?.[0] || "U"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground/80 max-w-[90px] truncate">
                        {user?.full_name?.split(" ")[0] || "Compte"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-foreground/50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-52 mt-2 rounded-2xl shadow-xl border-border/60 p-1">
                    {userRole === "guest" && (
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="cursor-pointer font-medium rounded-xl">
                          {t("nav_my_bookings")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === "host" && (
                      <DropdownMenuItem asChild>
                        <Link href="/host" className="cursor-pointer font-medium gap-2 rounded-xl">
                          <Home className="h-4 w-4 text-primary" />
                          {t("nav_host_dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer font-medium gap-2 rounded-xl">
                          <Shield className="h-4 w-4 text-primary" />
                          {t("nav_admin")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive font-medium gap-2 rounded-xl"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav_logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-sm text-foreground/70 hover:text-foreground">
                    {t("nav_login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 rounded-full shadow-sm btn-apple text-sm">
                    {t("nav_register")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
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
          <div className="md:hidden border-t border-border/50 py-4 space-y-0.5 bg-white/98">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start font-medium rounded-xl">{t("nav_home")}</Button>
            </Link>
            <Link href="/search" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start font-medium rounded-xl">{t("nav_search")}</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start font-medium rounded-xl">{t("footer_host")}</Button>
            </Link>
            {userRole ? (
              <div className="border-t border-border/50 pt-3 mt-2 flex flex-col gap-0.5">
                {userRole === "host" && (
                  <Link href="/host" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start font-medium gap-2 rounded-xl">
                      <Home className="h-4 w-4" />{t("nav_host_dashboard")}
                    </Button>
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start font-medium gap-2 rounded-xl">
                      <Shield className="h-4 w-4" />{t("nav_admin")}
                    </Button>
                  </Link>
                )}
                {userRole === "guest" && (
                  <Link href="/bookings" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start font-medium rounded-xl">{t("nav_my_bookings")}</Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-medium gap-2 text-destructive hover:text-destructive rounded-xl"
                  onClick={() => { setMobileOpen(false); handleLogout() }}
                >
                  <LogOut className="h-4 w-4" />{t("nav_logout")}
                </Button>
              </div>
            ) : (
              <div className="border-t border-border/50 pt-3 mt-2 flex flex-col gap-2 px-1">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full font-medium rounded-xl">{t("nav_login")}</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full">{t("nav_register")}</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
