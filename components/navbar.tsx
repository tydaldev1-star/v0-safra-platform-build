"use client"

import { useState } from "react"
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
import { Menu, X, User, Home, Shield, ChevronDown, LogOut, Heart, HelpCircle } from "lucide-react"

export function Navbar() {
  const { t, isRTL } = useI18n()
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const userRole = user?.role || null

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="navbar-booking sticky top-0 z-50">
      {/* Top bar — deep navy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[58px] gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <Image
              src="/images/safra-logo.png"
              alt="Safra"
              width={110}
              height={36}
              className="h-8 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-1">
            <LanguageSwitcher />

            <Link href="/register">
              <button className="text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5" />
                {t("footer_host")}
              </button>
            </Link>

            <Link href="/search">
              <button className="text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Aide
              </button>
            </Link>

            {userRole === "host" && (
              <Link href="/host">
                <button className={`text-sm font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${pathname === "/host" ? "bg-white/20 text-white" : "text-white/90 hover:text-white hover:bg-white/10"}`}>
                  <Home className="h-3.5 w-3.5" />
                  {t("nav_host_dashboard")}
                </button>
              </Link>
            )}

            {userRole === "admin" && (
              <Link href="/admin">
                <button className={`text-sm font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${pathname === "/admin" ? "bg-white/20 text-white" : "text-white/90 hover:text-white hover:bg-white/10"}`}>
                  <Shield className="h-3.5 w-3.5" />
                  {t("nav_admin")}
                </button>
              </Link>
            )}

            {userRole ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors ml-1">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-bold uppercase">
                      {user?.full_name?.[0] || "U"}
                    </div>
                    <span className="max-w-[80px] truncate">{user?.full_name?.split(" ")[0]}</span>
                    <ChevronDown className="h-3 w-3 text-white/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-52 mt-2 rounded shadow-xl border border-border p-1 bg-white">
                  {userRole === "guest" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="cursor-pointer text-sm font-medium text-foreground gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          {t("nav_my_bookings")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {userRole === "host" && (
                    <DropdownMenuItem asChild>
                      <Link href="/host" className="cursor-pointer text-sm font-medium gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        {t("nav_host_dashboard")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-sm font-medium gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {t("nav_admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm font-medium text-destructive gap-2">
                    <LogOut className="h-4 w-4" />
                    {t("nav_logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login">
                  <button className="text-white border border-white/60 hover:bg-white/10 text-sm font-semibold px-4 py-1.5 rounded transition-colors">
                    {t("nav_login")}
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-white text-accent hover:bg-white/90 text-sm font-bold px-4 py-1.5 rounded transition-colors">
                    {t("nav_register")}
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-1.5 rounded hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Secondary nav bar — slightly lighter blue */}
      <div className="hidden md:block bg-[#003d8f] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
            {[
              { href: "/search", label: t("nav_search") },
              { href: "/search?type=Appartement", label: t("type_apartment") },
              { href: "/search?type=Villa", label: t("type_villa") },
              { href: "/search?type=Chalet", label: t("type_chalet") },
              { href: "/search?type=Studio", label: t("type_studio") },
              { href: "/search?type=Tente+de+luxe", label: t("type_tent") },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium px-3 py-1.5 rounded whitespace-nowrap transition-colors flex items-center gap-1.5"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-accent border-t border-white/10 py-3 px-4 space-y-1">
          {[
            { href: "/", label: t("nav_home") },
            { href: "/search", label: t("nav_search") },
            { href: "/register", label: t("footer_host") },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <div className="text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-2 rounded transition-colors">
                {label}
              </div>
            </Link>
          ))}
          {userRole ? (
            <div className="border-t border-white/10 pt-2 mt-1 space-y-1">
              {userRole === "guest" && (
                <Link href="/bookings" onClick={() => setMobileOpen(false)}>
                  <div className="text-white/90 hover:bg-white/10 text-sm font-medium px-3 py-2 rounded">{t("nav_my_bookings")}</div>
                </Link>
              )}
              {userRole === "host" && (
                <Link href="/host" onClick={() => setMobileOpen(false)}>
                  <div className="text-white/90 hover:bg-white/10 text-sm font-medium px-3 py-2 rounded">{t("nav_host_dashboard")}</div>
                </Link>
              )}
              {userRole === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  <div className="text-white/90 hover:bg-white/10 text-sm font-medium px-3 py-2 rounded">{t("nav_admin")}</div>
                </Link>
              )}
              <button
                onClick={() => { setMobileOpen(false); handleLogout() }}
                className="w-full text-left text-red-300 hover:bg-white/10 text-sm font-medium px-3 py-2 rounded"
              >
                {t("nav_logout")}
              </button>
            </div>
          ) : (
            <div className="border-t border-white/10 pt-2 mt-1 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full border border-white/50 text-white text-sm font-semibold py-2 rounded hover:bg-white/10 transition-colors">
                  {t("nav_login")}
                </button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <button className="w-full bg-white text-accent text-sm font-bold py-2 rounded hover:bg-white/90 transition-colors">
                  {t("nav_register")}
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
