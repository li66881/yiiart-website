/** Display price is ~60% of compare-at during studio sale (≈40% OFF). */
export const STUDIO_SALE_PRICE_RATIO = 0.6

/**
 * Studio summer sale end (ISO). Override with NEXT_PUBLIC_SALE_ENDS_AT.
 * Countdown only renders while this timestamp is in the future.
 */
export function getStudioSaleEndsAt(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_SALE_ENDS_AT?.trim()
  if (fromEnv) {
    const parsed = Date.parse(fromEnv)
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
  }
  // Bound studio sale window for the current campaign.
  return "2026-08-31T23:59:59.000Z"
}

export function isStudioSaleActive(now = Date.now()) {
  const endsAt = getStudioSaleEndsAt()
  if (!endsAt) return false
  return Date.parse(endsAt) > now
}

export type SaleCountdownParts = {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getSaleCountdownParts(saleEndsAt: string, now = Date.now()): SaleCountdownParts {
  const diff = Math.max(0, Date.parse(saleEndsAt) - now)
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

/** Prefer days when the sale is more than a day away (avoid "614H"). */
export function formatSaleCountdown(saleEndsAt: string, now = Date.now()) {
  const parts = getSaleCountdownParts(saleEndsAt, now)
  if (parts.total <= 0) return null
  const hh = String(parts.hours).padStart(2, "0")
  const mm = String(parts.minutes).padStart(2, "0")
  const ss = String(parts.seconds).padStart(2, "0")
  if (parts.days > 0) {
    return `${parts.days}D : ${hh}H : ${mm}M`
  }
  return `${hh}H : ${mm}M : ${ss}S`
}

/**
 * Prefer CMS compare-at when it is higher than the selling price.
 * During an active studio sale, fall back to a synthetic compare-at from the sale ratio.
 */
export function resolveCompareAtCny(
  sellingPriceCny: number,
  compareAtFromCms?: number | null,
  saleActive = isStudioSaleActive(),
): number | null {
  const price = Number(sellingPriceCny)
  if (!Number.isFinite(price) || price <= 0) return null

  const fromCms = Number(compareAtFromCms)
  if (Number.isFinite(fromCms) && fromCms > price * 1.01) {
    return Math.round(fromCms)
  }

  if (saleActive) {
    return Math.round(price / STUDIO_SALE_PRICE_RATIO)
  }

  return null
}

export function saleOffPercent(sellingPriceCny: number, compareAtCny: number) {
  if (!(sellingPriceCny > 0) || !(compareAtCny > sellingPriceCny)) return null
  return Math.max(1, Math.round((1 - sellingPriceCny / compareAtCny) * 100))
}
