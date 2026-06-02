"use client"

import { useLanguage } from "@/context/LanguageContext"
import { useCurrency } from "@/context/CurrencyContext"

export default function StorefrontControls() {
  const { locale, setLocale, languageOptions } = useLanguage()
  const { currency, setCurrency, options } = useCurrency()

  return (
    <div className="flex items-center border text-xs sm:text-sm">
      <label className="sr-only" htmlFor="yiiart-language">
        Language
      </label>
      <select
        id="yiiart-language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="h-9 border-r bg-white px-1.5 text-xs outline-none hover:bg-gray-50 sm:px-2 sm:text-sm"
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="yiiart-currency">
        Currency
      </label>
      <select
        id="yiiart-currency"
        value={currency}
        onChange={(event) => setCurrency(event.target.value as typeof currency)}
        className="h-9 bg-white px-1.5 text-xs outline-none hover:bg-gray-50 sm:px-2 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
