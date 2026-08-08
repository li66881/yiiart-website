import assert from "node:assert/strict"
import test from "node:test"
import { getFooterNavigationModel, getHeaderNavigationModel } from "./catalog-presentation"

const navigationState = {
  visibleCollectionSlugs: ["large-canvas-art"],
  visibleCategories: ["Abstract"],
}

test("uses filtered links for Header desktop primary, secondary, and mobile navigation", () => {
  const model = getHeaderNavigationModel([
    { href: "/artworks", label: "Shop Art" },
    { href: "/collections/large-canvas-art", label: "Large Wall Art" },
    { href: "/collections/textured-wall-art", label: "Textured Wall Art" },
    { href: "/custom-painting", label: "Custom Painting" },
    { href: "/size-guide", label: "Size Guide" },
    { href: "/reviews", label: "Reviews" },
    { href: "/artists", label: "Artists" },
  ], navigationState)

  assert.deepEqual(model.primary.map((link) => link.label), ["Shop Art", "Large Wall Art", "Custom Painting", "Size Guide"])
  assert.deepEqual(model.secondary.map((link) => link.label), ["Reviews", "Artists"])
  assert.deepEqual(model.mobile.map((link) => link.label), ["Shop Art", "Large Wall Art", "Custom Painting", "Size Guide", "Reviews", "Artists"])
})

test("filters Footer shop links while retaining Footer support links", () => {
  const model = getFooterNavigationModel(
    [
      { href: "/artworks", label: "All Artworks" },
      { href: "/artworks?category=Abstract", label: "Abstract Art" },
      { href: "/artworks?category=Texture", label: "Textured Art" },
      { href: "/collections/large-canvas-art", label: "Large Wall Art" },
      { href: "/collections/textured-wall-art", label: "Textured Wall Art" },
      { href: "/custom-painting", label: "Custom Painting" },
    ],
    [
      { href: "/contact", label: "Contact" },
      { href: "/reviews", label: "Reviews" },
    ],
    navigationState,
  )

  assert.deepEqual(model.shop.map((link) => link.label), ["All Artworks", "Abstract Art", "Large Wall Art", "Custom Painting"])
  assert.deepEqual(model.support.map((link) => link.label), ["Contact", "Reviews"])
})
