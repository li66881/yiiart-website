"use client"

import { formatStorePrice, getPriceDisclosure, getStoreCurrency, StoreCurrency } from "@/lib/pricing"
import { useCurrency } from "@/context/CurrencyContext"

type PriceTextProps = {
  amountCny?: number | null
  className?: string
  currency?: StoreCurrency
}

export function PriceText({ amountCny, className, currency }: PriceTextProps) {
  const currencyContext = useCurrency()
  const displayCurrency = currency || currencyContext.currency

  return (
    <span className={className} suppressHydrationWarning>
      {formatStorePrice(amountCny, displayCurrency)}
    </span>
  )
}

export function PriceDisclosure({ className, currency }: { className?: string; currency?: StoreCurrency }) {
  const currencyContext = useCurrency()
  const displayCurrency = currency || currencyContext.currency

  return (
    <span className={className} suppressHydrationWarning>
      {getPriceDisclosure(displayCurrency, getStoreCurrency())}
    </span>
  )
}
