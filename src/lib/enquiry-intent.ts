export type EnquiryIntent = "size-advice" | "custom" | "project"

export function isEnquiryIntent(value?: string | null): value is EnquiryIntent {
  return value === "size-advice" || value === "project" || value === "custom"
}

export function parseEnquiryIntent(value?: string | null): EnquiryIntent {
  return isEnquiryIntent(value) ? value : "custom"
}

export function enquirySourceLabel(intent: EnquiryIntent, sourcePage?: string) {
  const page = sourcePage?.trim() || ""
  if (intent === "size-advice") return page ? `size-advice:${page}` : "size-advice"
  if (intent === "project") return page ? `project:${page}` : "project-enquiry"
  return page ? `custom:${page}` : "custom-painting-page"
}
