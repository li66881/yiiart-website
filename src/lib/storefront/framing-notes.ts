export const rolledCanvasDeliveryNote =
  "Rolled canvas is the listed format and ships in a protective tube. Stretched or framed delivery must be confirmed for the size, destination, and carrier before ordering."

export function normalizePublicFramingNotes(
  framingNotes: string | null | undefined,
  shippingProfile: string | null | undefined,
): string {
  const notes = typeof framingNotes === "string" ? framingNotes.trim() : ""
  if (!/Ships rolled for direct checkout\.?/i.test(notes)) return notes

  return shippingProfile === "Ships rolled"
    ? rolledCanvasDeliveryNote
    : "Delivery format is confirmed for the destination and selected size."
}

export function normalizePublicArtworkFramingNotes<T extends {
  framingNotes?: string | null
  shippingProfile?: string | null
}>(artwork: T): T {
  return {
    ...artwork,
    framingNotes: normalizePublicFramingNotes(artwork.framingNotes, artwork.shippingProfile),
  }
}
