"use client"

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import {
  getDefaultMarket,
  getMarketForCurrency,
  getMarketOption,
  getStoreCurrency,
  isStoreCurrency,
  isStoreMarketCode,
  StoreCurrency,
  StoreMarketCode,
  supportedCurrencies,
  supportedMarkets,
} from "@/lib/pricing"

type CurrencyContextType = {
  currency: StoreCurrency
  market: (typeof supportedMarkets)[number]
  marketCode: StoreMarketCode
  marketOptions: typeof supportedMarkets
  setCurrency: (currency: StoreCurrency) => void
  setMarket: (market: StoreMarketCode) => void
  options: typeof supportedCurrencies
}

const STORAGE_KEY = "yiiart-currency"
const MARKET_STORAGE_KEY = "yiiart-market"
const COOKIE_KEY = "yiiart_currency"
const MARKET_COOKIE_KEY = "yiiart_market"

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [marketCode, setMarketCodeState] = useState<StoreMarketCode>(getDefaultMarket().code)

  useEffect(() => {
    const savedMarket = localStorage.getItem(MARKET_STORAGE_KEY)
    const savedCurrency = localStorage.getItem(STORAGE_KEY)
    const nextMarket = isStoreMarketCode(savedMarket)
      ? getMarketOption(savedMarket) || getDefaultMarket()
      : isStoreCurrency(savedCurrency)
        ? getMarketForCurrency(savedCurrency)
        : getDefaultMarket()

    persistMarket(nextMarket.code, nextMarket.currency)
    setMarketCodeState(nextMarket.code)
  }, [])

  const value = useMemo(
    () => ({
      currency: (getMarketOption(marketCode) || getDefaultMarket()).currency,
      market: getMarketOption(marketCode) || getDefaultMarket(),
      marketCode,
      marketOptions: supportedMarkets,
      options: supportedCurrencies,
      setCurrency(nextCurrency: StoreCurrency) {
        const nextMarket = getMarketForCurrency(nextCurrency)
        setMarketCodeState(nextMarket.code)
        persistMarket(nextMarket.code, nextMarket.currency)
        window.dispatchEvent(new CustomEvent("yiiart:currency-change", { detail: nextMarket }))
      },
      setMarket(nextMarketCode: StoreMarketCode) {
        const nextMarket = getMarketOption(nextMarketCode)
        if (!nextMarket) return

        setMarketCodeState(nextMarket.code)
        persistMarket(nextMarket.code, nextMarket.currency)
        window.dispatchEvent(new CustomEvent("yiiart:currency-change", { detail: nextMarket }))
      },
    }),
    [marketCode]
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

function persistMarket(marketCode: StoreMarketCode, currency: StoreCurrency) {
  localStorage.setItem(MARKET_STORAGE_KEY, marketCode)
  localStorage.setItem(STORAGE_KEY, currency)
  document.cookie = `${MARKET_COOKIE_KEY}=${marketCode}; path=/; max-age=31536000; samesite=lax`
  document.cookie = `${COOKIE_KEY}=${currency}; path=/; max-age=31536000; samesite=lax`
}
