"use client"

type MarketingEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "Share"

type MarketingEventParams = Record<string, string | number | boolean | undefined>

const gaEventNames: Record<MarketingEventName, string> = {
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
  Lead: "generate_lead",
  Share: "share",
}

const pinterestEventNames: Record<MarketingEventName, string> = {
  ViewContent: "pagevisit",
  AddToCart: "addtocart",
  InitiateCheckout: "checkout",
  Purchase: "checkout",
  Lead: "lead",
  Share: "custom",
}

const tiktokEventNames: Record<MarketingEventName, string> = {
  ViewContent: "ViewContent",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  Purchase: "CompletePayment",
  Lead: "SubmitForm",
  Share: "ClickButton",
}

export function trackMarketingEvent(name: MarketingEventName, params: MarketingEventParams = {}) {
  if (typeof window === "undefined") return

  const win = window as typeof window & {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    pintrk?: (...args: any[]) => void
    ttq?: { track?: (event: string, params?: MarketingEventParams) => void }
  }

  win.gtag?.("event", gaEventNames[name], params)

  if (name === "Share") {
    win.fbq?.("trackCustom", "Share", params)
  } else {
    win.fbq?.("track", name, params)
  }

  win.pintrk?.("track", pinterestEventNames[name], params)
  win.ttq?.track?.(tiktokEventNames[name], params)
}

export function trackPageView(url: string) {
  if (typeof window === "undefined") return

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
