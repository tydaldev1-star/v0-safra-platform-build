"use client"

import Link from "next/link"
import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  const { t } = useI18n()

  const cols = [
    {
      title: "Assistance",
      links: [
        { label: "Aide et FAQ", href: "#" },
        { label: "Partenariats", href: "#" },
        { label: "Comment ça marche", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "À propos de Safra",
      links: [
        { label: "À propos", href: "#" },
        { label: "Carrières", href: "#" },
        { label: "Presse", href: "#" },
        { label: "Durabilité", href: "#" },
      ],
    },
    {
      title: "Hébergement",
      links: [
        { label: t("nav_search"), href: "/search" },
        { label: t("type_apartment"), href: "/search?type=Appartement" },
        { label: t("type_villa"), href: "/search?type=Villa" },
        { label: t("type_chalet"), href: "/search?type=Chalet" },
      ],
    },
    {
      title: "Hôtes",
      links: [
        { label: t("footer_host"), href: "/register" },
        { label: "Tableau de bord", href: "/host" },
        { label: "Publier une annonce", href: "/host/new-listing" },
      ],
    },
  ]

  return (
    <footer className="bg-[#003580] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/images/safra-logo.png"
                alt="Safra"
                width={100}
                height={34}
                className="h-8 w-auto object-contain brightness-0 invert mb-4"
              />
            </Link>
            <p className="text-white/60 text-[13px] leading-relaxed mb-5">
              La plateforme N°1 de location de vacances en Algérie.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-bold text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-white/60 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact row */}
        <div className="flex flex-wrap gap-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-[13px] text-white/60">
            <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
            Alger, Algérie
          </div>
          <div className="flex items-center gap-2 text-[13px] text-white/60">
            <Phone className="h-3.5 w-3.5 text-white/40 shrink-0" />
            +213 XX XX XX XX
          </div>
          <div className="flex items-center gap-2 text-[13px] text-white/60">
            <Mail className="h-3.5 w-3.5 text-white/40 shrink-0" />
            contact@safra.dz
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/40">
            © {new Date().getFullYear()} Safra. {t("footer_rights")}.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
            {[t("footer_terms"), t("footer_privacy"), "Accessibilité", "Cookies"].map((label) => (
              <Link key={label} href="#" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
