import type { MarketingCollection } from "./collections"

export function buildCollectionHeroCopy(collection: MarketingCollection) {
  return collection.intro.trim() || collection.description.trim()
}
