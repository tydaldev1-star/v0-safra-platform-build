"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-background">Safra</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              Safra vous connecte aux meilleurs logements en Algérie pour des séjours inoubliables.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-background/50 hover:text-background transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/50 hover:text-background transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/50 hover:text-background transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-3">Plateforme</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("nav_search")}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("footer_host")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("nav_login")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-background mb-3">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("footer_about")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("footer_terms")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("footer_privacy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/60 hover:text-background text-sm transition-colors">
                  {t("footer_contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} Safra. {t("footer_rights")}.
          </p>
          <p className="text-background/40 text-xs">Algérie · الجزائر</p>
        </div>
      </div>
    </footer>
  )
}
