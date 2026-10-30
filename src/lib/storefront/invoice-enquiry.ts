type InvoiceEnquiry = {
  title: string
  size: string
  finish: string
  quantity: number
  artworkUrl: string
}

export function buildInvoiceEnquiryUrl(baseUrl: string, selection: InvoiceEnquiry) {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    return baseUrl
  }
  if (url.protocol !== "https:" || url.hostname !== "wa.me") return baseUrl

  url.searchParams.set("text", [
    "Hello YiiArt, please confirm availability, shipping suitability, and the invoice total for this selection.",
    `Artwork: ${selection.title}`,
    `Size: ${selection.size}`,
    `Presentation: ${selection.finish}`,
    `Quantity: ${selection.quantity}`,
    `Artwork link: ${selection.artworkUrl}`,
  ].join("\n"))
  return url.toString()
}
