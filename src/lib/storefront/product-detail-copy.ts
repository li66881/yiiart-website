export function buildProductDetailCopy(input: { creationWindow?: string; shippingProfile?: string }) {
  return {
    processingTime: clean(input.creationWindow)
      || "Production timing is confirmed before the order is finalized.",
    dispatch: input.shippingProfile === "Ships rolled"
      ? "Rolled canvas ships unmounted in a protective tube. Stretched or float-framed delivery requires destination and carrier confirmation before payment."
      : clean(input.shippingProfile)
        || "Packaging format and carrier suitability are confirmed before dispatch.",
  }
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}
