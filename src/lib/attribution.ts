export const ATTRIBUTION_STORAGE_KEY = "yiiart-attribution"

export type EnquiryAttribution = {
  sourcePage: string
  landingPath: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const

export function parseEnquiryAttribution(input: {
  currentPath?: string
  search?: string
  stored?: Partial<EnquiryAttribution> | null
}): EnquiryAttribution {
  const params = new URLSearchParams(input.search || "")
  const stored = input.stored || {}
  const currentPath = input.currentPath || stored.sourcePage || ""

  const fromQuery = {
    utmSource: params.get("utm_source")?.trim() || "",
    utmMedium: params.get("utm_medium")?.trim() || "",
    utmCampaign: params.get("utm_campaign")?.trim() || "",
    utmContent: params.get("utm_content")?.trim() || "",
  }

  return {
    sourcePage: currentPath,
    landingPath: stored.landingPath || currentPath,
    utmSource: fromQuery.utmSource || stored.utmSource || "",
    utmMedium: fromQuery.utmMedium || stored.utmMedium || "",
    utmCampaign: fromQuery.utmCampaign || stored.utmCampaign || "",
    utmContent: fromQuery.utmContent || stored.utmContent || "",
  }
}

export function hasUtmParams(search: string) {
  const params = new URLSearchParams(search)
  return UTM_KEYS.some((key) => Boolean(params.get(key)?.trim()))
}

export function sanitizeEnquiryAttribution(form: FormData): EnquiryAttribution {
  return {
    sourcePage: clip(form.get("sourcePage"), 200),
    landingPath: clip(form.get("landingPath"), 200),
    utmSource: clip(form.get("utmSource"), 80),
    utmMedium: clip(form.get("utmMedium"), 80),
    utmCampaign: clip(form.get("utmCampaign"), 80),
    utmContent: clip(form.get("utmContent"), 80),
  }
}

function clip(value: FormDataEntryValue | null, max: number) {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, max)
}
