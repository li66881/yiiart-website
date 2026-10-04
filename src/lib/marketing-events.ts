"use client"

type MarketingEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "Contact"
  | "WhatsAppClick"
  | "Share"

type MarketingEventParams = Record<string, string | number | boolean | undefined>

const CONSENT_KEY = "yiiart-cookie-consent"

export function shouldTrackPageView(consentGranted: boolean, previousUrl: string | null, currentUrl: string) {
  return consentGranted && previousUrl !== currentUrl
}

type LocationChangeTarget = Pick<Window, "addEventListener" | "removeEventListener"> & {
  history: Pick<History, "pushState" | "replaceState">
}

export function subscribeToLocationChanges(target: LocationChangeTarget, onChange: () => void) {
  const { pushState, replaceState } = target.history

  target.history.pushState = function (...args) {
    pushState.apply(this, args)
    onChange()
  }
  target.history.replaceState = function (...args) {
    replaceState.apply(this, args)
    onChange()
  }
  target.addEventListener("popstate", onChange)

  return () => {
    target.history.pushState = pushState
    target.history.replaceState = replaceState
    target.removeEventListener("popstate", onChange)
  }
}

const gaEventNames: Record<MarketingEventName, string> = {
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
  Lead: "generate_lead",
  Contact: "select_content",
  WhatsAppClick: "whatsapp_click",
  Share: "share",
}

const pinterestEventNames: Record<MarketingEventName, string> = {
  ViewContent: "pagevisit",
  AddToCart: "addtocart",
  InitiateCheckout: "checkout",
  Purchase: "checkout",
  Lead: "lead",
  Contact: "custom",
  WhatsAppClick: "custom",
  Share: "custom",
}

const tiktokEventNames: Record<MarketingEventName, string> = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
  Lead: "SubmitForm",
  Contact: "ClickButton",
  WhatsAppClick: "ClickButton",
  Share: "ClickButton",
}

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted"
  } catch {
    return false
  }
}

export function publicMarketingParams(params: MarketingEventParams = {}) {
  const blocked = /email|phone|message|photo|file|address/i
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (value === undefined) return false
      if (blocked.test(key)) return false
      if (typeof value === "string" && value.includes("@")) return false
      return true
    }),
  ) as MarketingEventParams
}

export function trackMarketingEvent(name: MarketingEventName, params: MarketingEventParams = {}) {
  if (typeof window === "undefined") return
  if (!hasAnalyticsConsent()) return

  const safeParams = publicMarketingParams(params)
  const win = window as typeof window & {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    pintrk?: (...args: any[]) => void
    ttq?: { track?: (event: string, params?: MarketingEventParams) => void }
  }

  win.gtag?.("event", gaEventNames[name], safeParams)

  if (name === "Share" || name === "Contact" || name === "WhatsAppClick") {
    win.fbq?.("trackCustom", name, safeParams)
  } else {
    win.fbq?.("track", name, safeParams)
  }

  win.pintrk?.("track", pinterestEventNames[name], {
    ...safeParams,
    event_id: name,
  })
  win.ttq?.track?.(tiktokEventNames[name], safeParams)
}

export function trackPageView(url: string) {
  if (typeof window === "undefined") return
  if (!hasAnalyticsConsent()) return

  const win = window as typeof window & {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    pintrk?: (...args: any[]) => void
    ttq?: { page?: () => void }
  }

  win.gtag?.("event", "page_view", { page_location: url })
  win.fbq?.("track", "PageView")
  win.pintrk?.("page")
  win.ttq?.page?.()
}
