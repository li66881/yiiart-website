export type StoreCurrency = "CNY" | "USD" | "EUR"

const currencySymbols: Record<StoreCurrency, string> = {
  CNY: "CNY",
  USD: "$",
  EUR: "EUR",
}

export const supportedCurrencies: Array<{
  code: StoreCurrency
  label: string
  region: string
}> = [
  { code: "USD", label: "USD $", region: "United States" },
  { code: "EUR", label: "EUR", region: "Europe" },
  { code: "CNY", label: "CNY", region: "China" },
]

export function getStoreCurrency(rawCurrency?: string): StoreCurrency {
  const value = (rawCurrency || process.env.NEXT_PUBLIC_STORE_CURRENCY || "USD")
    .trim()
    .toUpperCase()

  if (value === "EUR" || value === "CNY" || value === "USD") {
    return value
  }

  return "USD"
}

export function convertCnyToStoreAmount(priceCny: number, currency = getStoreCurrency()) {
  if (!Number.isFinite(priceCny) || priceCny <= 0) return 0
  if (currency === "CNY") return priceCny

  const rate = getCnyExchangeRate(currency)
  return priceCny / rate
}

export function formatStorePrice(priceCny?: number | null, currency = getStoreCurrency()) {
  const numericPrice = Number(priceCny)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Price on request"
  }

  const amount = convertCnyToStoreAmount(numericPrice, currency)

  if (currency === "CNY") {
    return `CNY ${Math.round(amount).toLocaleString("en-US")}`
  }

  return `${currencySymbols[currency]}${Math.round(amount).toLocaleString("en-US")} ${currency}`
}

export function getPriceDisclosure(currency = getStoreCurrency(), checkoutCurrency = getStoreCurrency()) {
  if (currency !== checkoutCurrency) {
    return `Prices are displayed in ${currency} as an estimate. Secure checkout is processed in ${checkoutCurrency}.`
  }

  if (currency === "CNY") {
    return "Prices are listed in Chinese yuan."
  }

  return `Prices are shown in ${currency} for international checkout. Duties and local taxes may be charged by the destination country.`
}

function getCnyExchangeRate(currency: StoreCurrency) {
  if (currency === "EUR") {
    return Number(process.env.NEXT_PUBLIC_CNY_PER_EUR || "7.4")
  }

  return Number(process.env.NEXT_PUBLIC_CNY_PER_USD || "6.8")
}
