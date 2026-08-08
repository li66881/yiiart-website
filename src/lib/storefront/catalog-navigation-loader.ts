import { marketingCollections } from "@/lib/collections"
import { normalizeCategory } from "@/lib/artwork-display"
import { matchesMarketingCollection, visibleCollectionSlugs } from "./catalog-rules"
import type { CatalogNavigationState } from "./catalog-navigation"

export type CatalogInventoryLoader = () => Promise<unknown>

export function emptyCatalogNavigationState(): CatalogNavigationState {
  return { visibleCollectionSlugs: [], visibleCategories: [] }
}

export function buildCatalogNavigationState(inventory: unknown): CatalogNavigationState {
  if (!Array.isArray(inventory)) return emptyCatalogNavigationState()

  const collectionCounts = new Map(marketingCollections.map((collection) => [collection.slug, 0]))
  const categoryCounts = new Map<string, number>()

  for (const item of inventory) {
    if (!item || typeof item !== "object") continue
    const artwork = item as Parameters<typeof matchesMarketingCollection>[0]
    const category = normalizeCategory(artwork.category)
    if (category) categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)

    for (const collection of marketingCollections) {
      if (matchesMarketingCollection(artwork, collection)) {
        collectionCounts.set(collection.slug, (collectionCounts.get(collection.slug) || 0) + 1)
      }
    }
  }

  return {
    visibleCollectionSlugs: visibleCollectionSlugs(collectionCounts, 4),
    visibleCategories: visibleCollectionSlugs(categoryCounts, 4),
  }
}

export async function getCatalogNavigationStateFromLoader(loader: CatalogInventoryLoader): Promise<CatalogNavigationState> {
  try {
    return buildCatalogNavigationState(await loader())
  } catch {
    return emptyCatalogNavigationState()
  }
}
