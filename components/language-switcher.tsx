"use client"

import { useI18n } from "@/lib/i18n-context"
import type { Locale } from "@/lib/i18n"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇩🇿" },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const current = LANGUAGES.find((l) => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-foreground/80 hover:text-foreground">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current?.label}</span>
          <span className="sm:hidden">{current?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`gap-2 cursor-pointer ${locale === lang.code ? "font-semibold text-primary" : ""}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
