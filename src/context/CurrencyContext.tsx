"use client"

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { getStoreCurrency, StoreCurrency, supportedCurrencies } from "@/lib/pricing"

type CurrencyContextType = {
  currency: StoreCurrency
  setCurrency: (currency: StoreCurrency) => void
  options: typeof supportedCurrencies
}

const STORAGE_KEY = "yiiart-currency"
const COOKIE_KEY = "yiiart_currency"

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<StoreCurrency>(getStoreCurrency())

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isStoreCurrency(saved)) {
      setCurrencyState(saved)
      document.cookie = `${COOKIE_KEY}=${saved}; path=/; max-age=31536000; samesite=lax`
    }
  }, [])

  const value = useMemo(
    () => ({
      currency,
      options: supportedCurrencies,
      setCurrency(nextCurrency: StoreCurrency) {
        setCurrencyState(nextCurrency)
        localStorage.setItem(STORAGE_KEY, nextCurrency)
        document.cookie = `${COOKIE_KEY}=${nextCurrency}; path=/; max-age=31536000; samesite=lax`
        window.dispatchEvent(new CustomEvent("yiiart:currency-change", { detail: nextCurrency }))
      },
    }),
    [currency]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}

function isStoreCurrency(value: string | null): value is StoreCurrency {
  return value === "USD" || value === "EUR" || value === "CNY"
}
