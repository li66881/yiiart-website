export type EnquiryIntent = "size-advice" | "custom" | "project"

export function parseEnquiryIntent(value?: string | null): EnquiryIntent {
  if (value === "size-advice" || value === "project" || value === "custom") {
    return value
  }
  return "custom"
}

export function enquirySourceLabel(intent: EnquiryIntent, sourcePage?: string) {
  const page = sourcePage?.trim() || ""
  if (intent === "size-advice") return page ? `size-advice:${page}` : "size-advice"
  if (intent === "project") return page ? `project:${page}` : "project-enquiry"
  return page ? `custom:${page}` : "custom-painting-page"
}
