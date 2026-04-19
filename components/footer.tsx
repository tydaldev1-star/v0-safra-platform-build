"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-brand-navy-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/images/safra-logo.png"
                alt="Safra"
                width={130}
                height={48}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-5">
              Safra vous connecte aux meilleurs logements en Algérie pour des séjours inoubliables. Réservez en toute confiance.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Plateforme
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/search"
                  className="text-white/60 hover:text-accent text-sm transition-colors"
                >
                  {t("nav_search")}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-white/60 hover:text-accent text-sm transition-colors"
                >
                  {t("footer_host")}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/60 hover:text-accent text-sm transition-colors"
                >
                  {t("nav_login")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-white/60 hover:text-accent text-sm transition-colors"
                >
                  {t("footer_about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              {t("footer_contact")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <span>Alger, Algérie</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>+213 XX XX XX XX</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span>contact@safra.dz</span>
              </li>
            </ul>
            <div className="flex gap-2 mt-5">
              <Link href="#" className="text-white/50 hover:text-white text-xs transition-colors">
                {t("footer_terms")}
              </Link>
              <span className="text-white/20 text-xs">·</span>
              <Link href="#" className="text-white/50 hover:text-white text-xs transition-colors">
                {t("footer_privacy")}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Safra. {t("footer_rights")}.
          </p>
          <p className="text-white/30 text-xs font-arabic">
            الجزائر · Algérie · Algeria
          </p>
        </div>
      </div>
    </footer>
  )
}
