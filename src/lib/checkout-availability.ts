type CheckoutAvailabilityArtwork = {
  productionModel?: string | null
  allowCheckout?: boolean | null
  availability?: string | null
  reservedUntil?: string | null
  shippingProfile?: string | null
}

export function isArtworkCheckoutAvailable(
  artwork: CheckoutAvailabilityArtwork,
  now = Date.now(),
) {
  if (artwork.allowCheckout === false) return false
  if (
    artwork.productionModel === "hand_painted_to_order"
    && artwork.shippingProfile !== "Ships rolled"
  ) return false
  if (artwork.availability === "sold") return false
  if (artwork.availability === "reserved") {
    if (!artwork.reservedUntil) return false
    return new Date(artwork.reservedUntil).getTime() < now
  }
  return true
}
