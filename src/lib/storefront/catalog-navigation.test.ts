import assert from "node:assert/strict"
import test from "node:test"
import { filterCatalogLinks, type CatalogNavigationState } from "./catalog-navigation"

const emptyNavigationState: CatalogNavigationState = {
  visibleCollectionSlugs: [],
  visibleCategories: [],
}

test("fail-closed state hides catalog collection and category links", () => {
  const links = [
    { href: "/collections/large-canvas-art", label: "Large Wall Art" },
    { href: "/artworks?category=Abstract", label: "Abstract Art" },
    { href: "/custom-painting", label: "Custom Painting" },
  ]

  assert.deepEqual(
    filterCatalogLinks(links, emptyNavigationState).map((link) => link.href),
    ["/custom-painting"],
  )
})

test("keeps visible category links and hides empty categories", () => {
  const links = [
    { href: "/artworks?category=Abstract", label: "Abstract Art" },
    { href: "/artworks?category=Texture", label: "Textured Art" },
    { href: "/artworks", label: "All Artworks" },
  ]

  assert.deepEqual(
    filterCatalogLinks(links, {
      visibleCollectionSlugs: [],
      visibleCategories: ["Abstract"],
    }).map((link) => link.href),
    ["/artworks?category=Abstract", "/artworks"],
  )
})

test("keeps visible collection links and hides under-populated collections", () => {
  const links = [
    { href: "/collections/large-canvas-art", label: "Large Wall Art" },
    { href: "/collections/textured-wall-art", label: "Textured Wall Art" },
  ]

  assert.deepEqual(
    filterCatalogLinks(links, {
      visibleCollectionSlugs: ["large-canvas-art"],
      visibleCategories: [],
    }).map((link) => link.href),
    ["/collections/large-canvas-art"],
  )
})

test("preserves support links while catalog links are filtered", () => {
  const links = [
    { href: "/contact", label: "Contact" },
    { href: "/reviews", label: "Reviews" },
    { href: "/shipping-returns", label: "Shipping & Returns" },
  ]

  assert.deepEqual(
    filterCatalogLinks(links, emptyNavigationState).map((link) => link.href),
    links.map((link) => link.href),
  )
})
