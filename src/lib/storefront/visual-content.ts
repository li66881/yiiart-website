export function resolveVisualImage(images: string[], fallback?: string) {
  return images.find((value) => value.trim().length > 0) || fallback || null
}

export function handPaintedDisclosure(productionModel: string) {
  if (productionModel !== "hand_painted_to_order") return null

  return "Listing images illustrate the intended composition, palette, and room scale. Each canvas is hand-painted to order, so brushwork and small details will naturally vary."
}
