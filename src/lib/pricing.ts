export type StoreCurrency =
  | "AED"
  | "AUD"
  | "CAD"
  | "CNY"
  | "EUR"
  | "GBP"
  | "HKD"
  | "JPY"
  | "KRW"
  | "NZD"
  | "SGD"
  | "TWD"
  | "USD"

export type StoreMarketCode =
  | "AE"
  | "AU"
  | "CA"
  | "CN"
  | "DE"
  | "ES"
  | "FR"
  | "GB"
  | "HK"
  | "IT"
  | "JP"
  | "KR"
  | "NL"
  | "NZ"
  | "SG"
  | "TW"
  | "US"

export const supportedCurrencies: ReadonlyArray<{
  code: StoreCurrency
  label: string
  name: string
  symbol: string
}> = [
  { code: "AED", label: "AED د.إ", name: "UAE Dirham", symbol: "د.إ " },
  { code: "USD", label: "USD $", name: "US Dollar", symbol: "$" },
  { code: "CAD", label: "CAD $", name: "Canadian Dollar", symbol: "CA$" },
  { code: "GBP", label: "GBP £", name: "British Pound", symbol: "£" },
  { code: "EUR", label: "EUR €", name: "Euro", symbol: "€" },
  { code: "AUD", label: "AUD $", name: "Australian Dollar", symbol: "A$" },
  { code: "NZD", label: "NZD $", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SGD", label: "SGD $", name: "Singapore Dollar", symbol: "S$" },
  { code: "JPY", label: "JPY ¥", name: "Japanese Yen", symbol: "¥" },
  { code: "KRW", label: "KRW ₩", name: "South Korean Won", symbol: "₩" },
  { code: "CNY", label: "CNY ¥", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", label: "HKD $", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "TWD", label: "TWD $", name: "New Taiwan Dollar", symbol: "NT$" },
]

export const supportedMarkets: ReadonlyArray<{
  code: StoreMarketCode
  country: string
  currency: StoreCurrency
  flagCode: string
}> = [
  { code: "AE", country: "United Arab Emirates", currency: "AED", flagCode: "ae" },
  { code: "US", country: "United States", currency: "USD", flagCode: "us" },
  { code: "CA", country: "Canada", currency: "CAD", flagCode: "ca" },
  { code: "GB", country: "United Kingdom", currency: "GBP", flagCode: "gb" },
  { code: "DE", country: "Germany", currency: "EUR", flagCode: "de" },
  { code: "FR", country: "France", currency: "EUR", flagCode: "fr" },
  { code: "NL", country: "Netherlands", currency: "EUR", flagCode: "nl" },
  { code: "ES", country: "Spain", currency: "EUR", flagCode: "es" },
  { code: "IT", country: "Italy", currency: "EUR", flagCode: "it" },
  { code: "AU", country: "Australia", currency: "AUD", flagCode: "au" },
  { code: "NZ", country: "New Zealand", currency: "NZD", flagCode: "nz" },
  { code: "SG", country: "Singapore", currency: "SGD", flagCode: "sg" },
  { code: "JP", country: "Japan", currency: "JPY", flagCode: "jp" },
  { code: "KR", country: "South Korea", currency: "KRW", flagCode: "kr" },
  { code: "CN", country: "China", currency: "CNY", flagCode: "cn" },
  { code: "HK", country: "Hong Kong SAR", currency: "HKD", flagCode: "hk" },
  { code: "TW", country: "Taiwan", currency: "TWD", flagCode: "tw" },
]

export function getStoreCurrency(rawCurrency?: string): StoreCurrency {
  const value = (rawCurrency || process.env.NEXT_PUBLIC_STORE_CURRENCY || "USD")
    .trim()
    .toUpperCase()

  if (isStoreCurrency(value)) {
    return value
  }

  return "USD"
}

export function isStoreCurrency(value: string | null | undefined): value is StoreCurrency {
  return supportedCurrencies.some((currency) => currency.code === value)
}

export function isStoreMarketCode(value: string | null | undefined): value is StoreMarketCode {
  return supportedMarkets.some((market) => market.code === value)
}

export function getCurrencyOption(currency: StoreCurrency) {
  return supportedCurrencies.find((option) => option.code === currency) || supportedCurrencies[0]
}

export function getMarketOption(code?: string | null) {
  return supportedMarkets.find((market) => market.code === code)
}

export function getDefaultMarket() {
  const configuredMarket = getMarketOption(process.env.NEXT_PUBLIC_STORE_MARKET)
  if (configuredMarket) return configuredMarket

  const configuredCurrency = getStoreCurrency()
  return supportedMarkets.find((market) => market.currency === configuredCurrency) || supportedMarkets[0]
}

export function getMarketForCurrency(currency: StoreCurrency) {
  return supportedMarkets.find((market) => market.currency === currency) || getDefaultMarket()
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
  const roundedAmount = Math.round(amount)

  return `${getCurrencyOption(currency).symbol}${roundedAmount.toLocaleString("en-US")} ${currency}`
}

export function getPriceDisclosure(currency = getStoreCurrency(), checkoutCurrency = getStoreCurrency()) {
  const displayCurrency = getCurrencyOption(currency)
  const secureCheckoutCurrency = getCurrencyOption(checkoutCurrency)

  if (currency !== checkoutCurrency) {
    return `Prices are displayed in ${displayCurrency.name} (${currency}) as an estimate. Secure checkout is processed in ${secureCheckoutCurrency.name} (${checkoutCurrency}).`
  }

  if (currency === "CNY") {
    return "Prices are listed in Chinese Yuan (CNY)."
  }

  return `Prices are shown in ${displayCurrency.name} (${currency}) for international checkout. Duties and local taxes may be charged by the destination country.`
}

function getCnyExchangeRate(currency: StoreCurrency) {
  const cnyPerCurrency: Record<StoreCurrency, number> = {
    AED: Number(process.env.NEXT_PUBLIC_CNY_PER_AED || "1.96"),
    AUD: Number(process.env.NEXT_PUBLIC_CNY_PER_AUD || "4.7"),
    CAD: Number(process.env.NEXT_PUBLIC_CNY_PER_CAD || "5.3"),
    CNY: 1,
    EUR: Number(process.env.NEXT_PUBLIC_CNY_PER_EUR || "7.8"),
    GBP: Number(process.env.NEXT_PUBLIC_CNY_PER_GBP || "9.1"),
    HKD: Number(process.env.NEXT_PUBLIC_CNY_PER_HKD || "0.92"),
    JPY: Number(process.env.NEXT_PUBLIC_CNY_PER_JPY || "0.05"),
    KRW: Number(process.env.NEXT_PUBLIC_CNY_PER_KRW || "0.0052"),
    NZD: Number(process.env.NEXT_PUBLIC_CNY_PER_NZD || "4.4"),
    SGD: Number(process.env.NEXT_PUBLIC_CNY_PER_SGD || "5.4"),
    TWD: Number(process.env.NEXT_PUBLIC_CNY_PER_TWD || "0.22"),
    USD: Number(process.env.NEXT_PUBLIC_CNY_PER_USD || "7.2"),
  }

  const rate = cnyPerCurrency[currency]
  return Number.isFinite(rate) && rate > 0 ? rate : cnyPerCurrency.USD
}
