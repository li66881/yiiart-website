import { unstable_cache } from "next/cache"
import { getMarketingCollection, marketingCollections, type MarketingCollection } from "@/lib/collections"
import { normalizeCategory } from "@/lib/artwork-display"
import { inferArtworkSize } from "@/lib/artwork-discovery"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { parsePhysicalDimensions, readPhysicalDimensions } from "@/lib/physical-dimensions"
import { client } from "@/lib/sanity"

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

export type CatalogNavigationState = {
  visibleCollectionSlugs: string[]
  visibleCategories: string[]
}

type CatalogLink = { href: string }

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

export function matchesMarketingCollection(artwork: CollectionArtwork, collection: MarketingCollection) {
  if (collection.seriesSlug) return artwork.seriesSlug === collection.seriesSlug
  if (collection.categories?.length) return collection.categories.includes(normalizeCategory(artwork.category))
  if (collection.slug === "large-canvas-art") {
    const dimensions = readPhysicalDimensions(artwork.widthCm, artwork.heightCm)
      || parsePhysicalDimensions(artwork.dimensions)
    if (!dimensions) return false

    const size = inferArtworkSize(`${dimensions.widthCm} x ${dimensions.heightCm} cm`)
    return size === "Large" || size === "Oversized"
  }
  return false
}

export function visibleCollectionSlugs(counts: ReadonlyMap<string, number>, minimum: number) {
  return Array.from(counts, ([slug, count]) => ({ slug, count }))
    .filter(({ count }) => count >= minimum)
    .map(({ slug }) => slug)
}

export function filterCatalogLinks<Link extends CatalogLink>(links: readonly Link[], state: CatalogNavigationState) {
  const visibleCollectionSlugs = new Set(state.visibleCollectionSlugs)
  const visibleCategories = new Set(state.visibleCategories)

  return links.filter((link) => {
    const url = new URL(link.href, "https://yiiart.example")
    const collectionSlug = url.pathname.match(/^\/collections\/([^/]+)$/)?.[1]

    if (collectionSlug) return visibleCollectionSlugs.has(collectionSlug)
    if (url.pathname !== "/artworks") return true

    const category = url.searchParams.get("category")
    return !category || visibleCategories.has(normalizeCategory(category))
  })
}

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
