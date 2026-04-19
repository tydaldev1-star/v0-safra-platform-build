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

const LANGUAGES: { code: Locale; label: string; short: string }[] = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "AR" },
]

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useI18n()
  const current = LANGUAGES.find((l) => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium text-foreground/80 hover:text-primary">
          <Globe className="h-3.5 w-3.5" />
          <span>{current?.short}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "start" : "end"}
        className="w-36 mt-1 p-1"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`gap-3 cursor-pointer rounded-md px-3 py-2 text-sm ${
              locale === lang.code
                ? "font-semibold text-primary bg-primary/5"
                : "text-foreground/70"
            }`}
          >
            <span className="text-xs font-bold w-6 text-center opacity-60">{lang.short}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
