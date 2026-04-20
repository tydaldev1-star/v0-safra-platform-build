"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-[oklch(0.13_0.06_258)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/8">

          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/safra-logo.png"
                alt="Safra"
                width={110}
                height={40}
                className="h-9 w-auto object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-white/50 text-[13px] leading-relaxed max-w-xs mb-6 font-light">
              Safra vous connecte aux meilleurs logements en Algérie pour des séjours inoubliables. Réservez en toute confiance.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
              Plateforme
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/search", label: t("nav_search") },
                { href: "/register", label: t("footer_host") },
                { href: "/login", label: t("nav_login") },
                { href: "#", label: t("footer_about") },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] text-white/45 hover:text-white transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
              {t("footer_contact")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                <span className="text-[13px] text-white/45">Alger, Algérie</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-[13px] text-white/45">+213 XX XX XX XX</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-[13px] text-white/45">contact@safra.dz</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} Safra. {t("footer_rights")}.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[12px] text-white/25 hover:text-white/50 transition-colors">{t("footer_terms")}</Link>
            <span className="text-white/15">·</span>
            <Link href="#" className="text-[12px] text-white/25 hover:text-white/50 transition-colors">{t("footer_privacy")}</Link>
            <span className="text-white/15">·</span>
            <span className="text-[12px] text-white/20 font-arabic">الجزائر</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
