"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import en from "../../messages/en.json"
import zh from "../../messages/zh.json"
import de from "../../messages/de.json"
import fr from "../../messages/fr.json"
import ar from "../../messages/ar.json"

export const languageOptions = [
  { code: "en", label: "EN", name: "English", flagCode: "us", dir: "ltr" },
  { code: "de", label: "DE", name: "Deutsch", flagCode: "de", dir: "ltr" },
  { code: "fr", label: "FR", name: "Français", flagCode: "fr", dir: "ltr" },
  { code: "zh", label: "ZH", name: "中文", flagCode: "cn", dir: "ltr" },
  { code: "ar", label: "AR", name: "العربية", flagCode: "ae", dir: "rtl" },
] as const

type Messages = Record<string, any>
export type Language = (typeof languageOptions)[number]["code"]

interface LanguageContextType {
  locale: Language
  languageOptions: typeof languageOptions
  t: (key: string) => string
  setLocale: (locale: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const messages: Record<Language, Messages> = { en, zh, de, fr, ar }

function isLanguage(value: string | null): value is Language {
  return languageOptions.some((option) => option.code === value)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("yiiart-locale")
    const nextLocale = isLanguage(saved) ? saved : "en"
    setLocale(nextLocale)
    applyDocumentLanguage(nextLocale)
  }, [])

  const t = (key: string): string => {
    const translated = getMessageValue(messages[locale], key)
    if (translated) return translated

    return getMessageValue(messages.en, key) || key
  }

  const handleSetLocale = (newLocale: Language) => {
    setLocale(newLocale)
    localStorage.setItem("yiiart-locale", newLocale)
    applyDocumentLanguage(newLocale)
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

function applyDocumentLanguage(nextLocale: Language) {
  const option = languageOptions.find((item) => item.code === nextLocale) || languageOptions[0]
  document.documentElement.lang = nextLocale
  document.documentElement.dir = option.dir
}

function getMessageValue(dictionary: Messages, key: string) {
  const keys = key.split(".")
  let value: any = dictionary

  for (const item of keys) {
    if (value && typeof value === "object" && item in value) {
      value = value[item]
    } else {
      return ""
    }
  }

  return typeof value === "string" ? value : ""
}
