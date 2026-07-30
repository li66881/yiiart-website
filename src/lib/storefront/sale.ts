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
