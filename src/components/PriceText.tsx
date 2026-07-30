"use client"

import { formatStorePrice, getCurrencyOption, getStoreCurrency, StoreCurrency } from "@/lib/pricing"
import { useCurrency } from "@/context/CurrencyContext"
import { useLanguage } from "@/context/LanguageContext"

type PriceTextProps = {
  amountCny?: number | null
  className?: string
  currency?: StoreCurrency
}

export function PriceText({ amountCny, className, currency }: PriceTextProps) {
  const currencyContext = useCurrency()
  const { t } = useLanguage()
  const displayCurrency = currency || currencyContext.currency
  const numericPrice = Number(amountCny)
  const label = Number.isFinite(numericPrice) && numericPrice > 0
    ? formatStorePrice(amountCny, displayCurrency)
    : t("price.request")

  return (
    <span className={className} suppressHydrationWarning>
      {label}
    </span>
  )
}

export function PriceDisclosure({ className, currency }: { className?: string; currency?: StoreCurrency }) {
  const currencyContext = useCurrency()
  const { t } = useLanguage()
  const displayCurrency = currency || currencyContext.currency
  const checkoutCurrency = getStoreCurrency()

  return (
    <span className={className} suppressHydrationWarning>
      {formatLocalizedPriceDisclosure(t, displayCurrency, checkoutCurrency)}
    </span>
  )
}

function formatLocalizedPriceDisclosure(
  t: (key: string) => string,
  displayCurrency: StoreCurrency,
  checkoutCurrency: StoreCurrency
) {
  const displayName = getLocalizedCurrencyName(t, displayCurrency)
  const checkoutName = getLocalizedCurrencyName(t, checkoutCurrency)

  if (displayCurrency !== checkoutCurrency) {
    return formatTemplate(t("price.estimate"), {
      displayName,
      displayCurrency,
      checkoutName,
      checkoutCurrency,
    })
  }

  if (displayCurrency === "CNY") {
    return t("price.cny")
  }

  return formatTemplate(t("price.international"), {
    displayName,
    displayCurrency,
  })
}

function getLocalizedCurrencyName(t: (key: string) => string, currency: StoreCurrency) {
  const key = `currency.name.${currency}`
  const value = t(key)
  return value === key ? getCurrencyOption(currency).name : value
}

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template
  )
}
