"use client"

import { useEffect, useRef, useState } from "react"
import FlagIcon from "@/components/FlagIcon"
import { useLanguage } from "@/context/LanguageContext"
import { useCurrency } from "@/context/CurrencyContext"
import { getCurrencyOption, StoreMarketCode } from "@/lib/pricing"

type OpenPanel = "language" | "market" | null

export default function StorefrontControls() {
  const { locale, setLocale, languageOptions, t } = useLanguage()
  const { market, marketOptions, setMarket } = useCurrency()
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const controlsRef = useRef<HTMLDivElement>(null)

  const selectedLanguage = languageOptions.find((option) => option.code === locale) || languageOptions[0]
  const selectedMarketName = translateWithFallback(t, `market.country.${market.code}`, market.country)

  useEffect(() => {
    if (!openPanel) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setOpenPanel(null)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPanel(null)
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [openPanel])

  return (
    <div ref={controlsRef} className="relative flex items-center border bg-white text-xs sm:text-sm">
      <button
        id="yiiart-language"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={openPanel === "language"}
        onClick={() => setOpenPanel(openPanel === "language" ? null : "language")}
        className="flex h-9 items-center gap-1.5 border-r px-2 outline-none transition hover:bg-gray-50"
      >
        <FlagIcon code={selectedLanguage.flagCode} label={selectedLanguage.name} />
        <span>{selectedLanguage.label}</span>
        <span aria-hidden="true" className="text-gray-400">v</span>
      </button>

      <button
        id="yiiart-market"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={openPanel === "market"}
        onClick={() => setOpenPanel(openPanel === "market" ? null : "market")}
        className="flex h-9 min-w-0 items-center gap-1.5 px-2 outline-none transition hover:bg-gray-50"
      >
        <FlagIcon code={market.flagCode} label={selectedMarketName} />
        <span className="hidden max-w-28 truncate sm:inline">{selectedMarketName}</span>
        <span>{market.currency}</span>
        <span aria-hidden="true" className="text-gray-400">v</span>
      </button>

      {openPanel === "language" && (
        <div
          className="absolute right-0 top-11 z-50 w-72 border bg-white p-2 shadow-xl"
          role="listbox"
          aria-label={t("common.language")}
        >
          <p className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">{t("common.language")}</p>
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              role="option"
              aria-selected={option.code === locale}
              onClick={() => {
                setLocale(option.code)
                setOpenPanel(null)
              }}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-gray-50 ${
                option.code === locale ? "bg-gray-100" : ""
              }`}
            >
              <span className="flex items-center gap-3">
                <FlagIcon code={option.flagCode} label={option.name} />
                <span>
                  <span className="block font-medium">{option.name}</span>
                  <span className="block text-xs text-gray-500">{option.label}</span>
                </span>
              </span>
              {option.code === locale && <span className="text-xs text-gray-500">{t("common.selected")}</span>}
            </button>
          ))}
        </div>
      )}

      {openPanel === "market" && (
        <div
          className="absolute right-0 top-11 z-50 max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-auto border bg-white p-2 shadow-xl"
          role="listbox"
          aria-label={t("common.countryCurrency")}
        >
          <p className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">{t("common.countryCurrency")}</p>
          {marketOptions.map((option) => {
            const currency = getCurrencyOption(option.currency)
            const countryName = translateWithFallback(t, `market.country.${option.code}`, option.country)
            const currencyName = translateWithFallback(t, `currency.name.${currency.code}`, currency.name)

            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={option.code === market.code}
                onClick={() => {
                  setMarket(option.code as StoreMarketCode)
                  setOpenPanel(null)
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-gray-50 ${
                  option.code === market.code ? "bg-gray-100" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FlagIcon code={option.flagCode} label={countryName} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{countryName}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {currencyName} ({currency.label})
                    </span>
                  </span>
                </span>
                {option.code === market.code && <span className="text-xs text-gray-500">{t("common.selected")}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function translateWithFallback(t: (key: string) => string, key: string, fallback: string) {
  const value = t(key)
  return value === key ? fallback : value
}
