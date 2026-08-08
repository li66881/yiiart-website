import { normalizeCategory } from "@/lib/artwork-display"

export type CatalogNavigationState = {
  visibleCollectionSlugs: string[]
  visibleCategories: string[]
}

type CatalogLink = { href: string }

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
