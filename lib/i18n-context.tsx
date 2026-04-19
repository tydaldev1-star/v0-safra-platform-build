"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, type Locale, type TranslationKey } from "./i18n"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
  isRTL: false,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr")

  useEffect(() => {
    const stored = localStorage.getItem("safra-locale") as Locale | null
    if (stored && ["fr", "en", "ar"].includes(stored)) {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("safra-locale", newLocale)
    // Update html element for RTL and lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", newLocale === "ar" ? "rtl" : "ltr")
      document.documentElement.setAttribute("lang", newLocale)
    }
  }

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations["fr"][key] || key
  }

  const isRTL = locale === "ar"

  // Sync dir/lang on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr")
      document.documentElement.setAttribute("lang", locale)
    }
  }, [locale, isRTL])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL }}>
      <div className={isRTL ? "font-arabic" : "font-sans"}>
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
