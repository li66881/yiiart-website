import "server-only"
import { unstable_cache } from "next/cache"
import { getMarketingCollection } from "@/lib/collections"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { client } from "@/lib/sanity"
import { matchesMarketingCollection, visibleCollectionSlugs } from "./catalog-rules"
import type { CatalogNavigationState } from "./catalog-navigation"
import { getCatalogNavigationStateFromLoader } from "./catalog-navigation-loader"

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
  return getCatalogNavigationStateFromLoader(fetchPublicCollectionInventory)
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
