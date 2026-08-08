import assert from "node:assert/strict"
import test from "node:test"
import {
  matchesMarketingCollection,
  visibleCollectionSlugs,
} from "./catalog-rules"
import { filterCatalogLinks } from "./catalog-navigation"

test("requires four public products for primary navigation", () => {
  assert.deepEqual(visibleCollectionSlugs(new Map([
    ["large-canvas-art", 4],
    ["textured-wall-art", 3],
    ["neutral-canvas-art", 0],
  ]), 4), ["large-canvas-art"])
})

test("matches category collections without inventing fallback products", () => {
  const collection = { slug: "textured-wall-art", categories: ["Texture", "Textured Art"] } as any
  assert.equal(matchesMarketingCollection({ category: "Texture" }, collection), true)
  assert.equal(matchesMarketingCollection({ category: "Abstract" }, collection), false)
})

test("matches large art from physical dimensions", () => {
  const collection = { slug: "large-canvas-art" } as any
  assert.equal(matchesMarketingCollection({ dimensions: "120 x 180 cm" }, collection), true)
  assert.equal(matchesMarketingCollection({ widthCm: 120, heightCm: 80 }, collection), true)
  assert.equal(matchesMarketingCollection({ dimensions: "40 x 40 cm" }, collection), false)
})

test("never treats image pixels as physical large-art dimensions", () => {
  const collection = { slug: "large-canvas-art" } as any
  assert.equal(matchesMarketingCollection({ dimensions: "120 x 180 pixels" }, collection), false)
  assert.equal(matchesMarketingCollection({ dimensions: "120 x 180 px" }, collection), false)
})

test("filters only catalog links and keeps support links", () => {
  const links = [
    { href: "/collections/large-canvas-art", label: "Large Wall Art" },
    { href: "/collections/textured-wall-art", label: "Textured Wall Art" },
    { href: "/custom-painting", label: "Custom Painting" },
  ]
  assert.deepEqual(filterCatalogLinks(links, {
    visibleCollectionSlugs: ["large-canvas-art"],
    visibleCategories: [],
  }).map((link) => link.href), ["/collections/large-canvas-art", "/custom-painting"])
})
