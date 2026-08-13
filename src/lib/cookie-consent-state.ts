export type CookieConsentBodyTarget = {
  dataset: {
    cookieConsentVisible?: string
  }
  style: {
    setProperty: (name: string, value: string) => unknown
    removeProperty: (name: string) => unknown
  }
}

export function clearCookieConsentBodyState(target: CookieConsentBodyTarget) {
  delete target.dataset.cookieConsentVisible
  target.style.removeProperty("--cookie-consent-height")
}

export function applyCookieConsentBodyState(
  target: CookieConsentBodyTarget,
  height: number,
) {
  const safeHeight = Number.isFinite(height) ? Math.max(0, Math.ceil(height)) : 0
  target.dataset.cookieConsentVisible = "true"
  target.style.setProperty("--cookie-consent-height", `${safeHeight}px`)
  return () => clearCookieConsentBodyState(target)
}
