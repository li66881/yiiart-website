type TileCollectionCueInput = {
  collectionType: string
  productionModel: string
}

export function visibleFilterOptions(
  options: string[],
  counts: Map<string, number>,
  active: string[],
) {
  return options.filter((option) => (counts.get(option) || 0) > 0 || active.includes(option))
}

export function tileCollectionCue({ collectionType, productionModel }: TileCollectionCueInput) {
  if (collectionType === "artist_collection") return "Artist collection"
  if (productionModel === "hand_painted_to_order") return "Hand-painted to order"
  return null
}

export function headerNavigationGroups<T>(items: T[]) {
  return {
    primary: items.slice(0, 4),
    secondary: items.slice(4),
  }
}

export function productDetailGroups() {
  return [
    { id: "artwork", eyebrow: "Artwork details", title: "Know the work before it enters your room." },
    { id: "room", eyebrow: "Size and room guidance", title: "Check the scale before you choose." },
    { id: "care", eyebrow: "Handmade, shipping and support", title: "Clear support for a made-to-order canvas." },
  ] as const
}
