export function buildProductDetailCopy(input: { creationWindow?: string; shippingProfile?: string }) {
  return {
    processingTime: clean(input.creationWindow)
      || "Production timing is confirmed before the order is finalized.",
    dispatch: clean(input.shippingProfile)
      || "Packaging format is confirmed before dispatch.",
  }
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}
