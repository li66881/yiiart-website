import "server-only"
import { unstable_cache } from "next/cache"
import { getMarketingCollection, marketingCollections } from "@/lib/collections"
import { normalizeCategory } from "@/lib/artwork-display"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { client } from "@/lib/sanity"
import { matchesMarketingCollection, visibleCollectionSlugs } from "./catalog-rules"
import type { CatalogNavigationState } from "./catalog-navigation"

export { filterCatalogLinks } from "./catalog-navigation"
export type { CatalogNavigationState } from "./catalog-navigation"
export { matchesMarketingCollection, visibleCollectionSlugs } from "./catalog-rules"

export type CollectionArtwork = {
  _id?: string
  slug?: { current?: string }
  category?: string | null
  dimensions?: string | null
  widthCm?: number | string | null
  heightCm?: number | string | null
  orientation?: string | null
  seriesSlug?: string | null
}

const publicCollectionInventoryQuery = `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}]{
  _id,
  slug,
  category,
  dimensions,
  widthCm,
  heightCm,
  orientation,
  seriesSlug
}`

const fetchPublicCollectionInventory = unstable_cache(
  async () => client.fetch<CollectionArtwork[]>(publicCollectionInventoryQuery),
  ["public-collection-inventory-v1"],
  { revalidate: 600 },
)

export async function getCatalogNavigationState(): Promise<CatalogNavigationState> {
  try {
    const artworks = await fetchPublicCollectionInventory()
    if (!Array.isArray(artworks)) return emptyCatalogNavigationState()

    const collectionCounts = new Map(marketingCollections.map((collection) => [collection.slug, 0]))
    const categoryCounts = new Map<string, number>()

    for (const artwork of artworks) {
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
  } catch {
    return emptyCatalogNavigationState()
  }
}

export async function getCollectionArtworks(slug: string): Promise<CollectionArtwork[]> {
  const collection = getMarketingCollection(slug)
  if (!collection) return []

  try {
    const artworks = await client.fetch<CollectionArtwork[]>(
      `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc, _id asc){
        ...,
        artist->{name}
      }`,
    )

    return Array.isArray(artworks) ? artworks.filter((artwork) => matchesMarketingCollection(artwork, collection)) : []
  } catch {
    return []
  }
}

function emptyCatalogNavigationState(): CatalogNavigationState {
  return { visibleCollectionSlugs: [], visibleCategories: [] }
}
