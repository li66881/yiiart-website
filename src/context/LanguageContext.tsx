"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import en from "../../messages/en.json"
import zh from "../../messages/zh.json"
import de from "../../messages/de.json"
import fr from "../../messages/fr.json"

export const languageOptions = [
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "fr", label: "FR", name: "Francais" },
  { code: "zh", label: "ZH", name: "中文" },
] as const

type Messages = typeof en
export type Language = (typeof languageOptions)[number]["code"]

interface LanguageContextType {
  locale: Language
  languageOptions: typeof languageOptions
  t: (key: string) => string
  setLocale: (locale: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const messages: Record<Language, Messages> = { en, zh, de, fr }

function isLanguage(value: string | null): value is Language {
  return languageOptions.some((option) => option.code === value)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("yiiart-locale")
    const nextLocale = isLanguage(saved) ? saved : "en"
    setLocale(nextLocale)
    document.documentElement.lang = nextLocale
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
    <LanguageContext.Provider value={{ locale, languageOptions, t, setLocale: handleSetLocale }}>
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
