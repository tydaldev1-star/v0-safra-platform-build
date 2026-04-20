"use client"

import { useI18n } from "@/lib/i18n-context"
import type { Locale } from "@/lib/i18n"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "ar", label: "العربية",  flag: "🇩🇿" },
]

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useI18n()
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-white/90 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded transition-colors text-sm font-medium">
          <span className="text-base leading-none">{current.flag}</span>
          <span className="uppercase text-xs font-bold tracking-wide">{current.code}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "start" : "end"}
        className="w-40 mt-1 p-1 bg-white shadow-xl border border-border rounded"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`gap-3 cursor-pointer rounded px-3 py-2 text-sm flex items-center ${
              locale === lang.code
                ? "font-semibold text-primary bg-primary/5"
                : "text-foreground/70 hover:bg-secondary"
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
