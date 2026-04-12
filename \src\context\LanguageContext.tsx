"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import en from "../../messages/en.json"
import zh from "../../messages/zh.json"

type Messages = typeof en
type Language = "en" | "zh"

interface LanguageContextType {
  locale: Language
  t: (key: string) => string
  setLocale: (locale: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const messages: Record<Language, Messages> = { en, zh }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("yiiart-locale") as Language
    if (saved && (saved === "en" || saved === "zh")) {
      setLocale(saved)
    }
  }, [])

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = messages[locale]
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    return typeof value === "string" ? value : key
  }

  const handleSetLocale = (newLocale: Language) => {
    setLocale(newLocale)
    localStorage.setItem("yiiart-locale", newLocale)
    document.documentElement.lang = newLocale
  }

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale: handleSetLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
