import assert from "node:assert/strict"
import test from "node:test"
import {
  matchesMarketingCollection,
  shouldIndexMarketingCollection,
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

test("room collection indexability uses a four-product floor", () => {
  const roomCollection = { slug: "dining-room-wall-art", group: "room" } as any
  const styleCollection = { slug: "textured-wall-art", group: "style" } as any
  assert.equal(shouldIndexMarketingCollection(roomCollection, 0), false)
  assert.equal(shouldIndexMarketingCollection(roomCollection, 3), false)
  assert.equal(shouldIndexMarketingCollection(roomCollection, 4), true)
  assert.equal(shouldIndexMarketingCollection(styleCollection, 0), true)
})

test("matches room collections only from explicit room tags", () => {
  const collection = { slug: "dining-room-wall-art", roomTypes: ["Dining room"] } as any
  assert.equal(matchesMarketingCollection({ roomTypes: ["Dining room"] }, collection), true)
  assert.equal(matchesMarketingCollection({ roomTypes: [" dining ROOM "] }, collection), true)
  assert.equal(matchesMarketingCollection({ roomTypes: null }, collection), false)
  assert.equal(matchesMarketingCollection({ category: "Dining" }, collection), false)
})

test("combines category and room collection constraints with AND semantics", () => {
  const collection = {
    slug: "abstract-art-for-living-room",
    categories: ["Abstract"],
    roomTypes: ["Living room"],
  } as any
  assert.equal(matchesMarketingCollection({ category: "Abstract", roomTypes: ["Living room"] }, collection), true)
  assert.equal(matchesMarketingCollection({ category: "Abstract", roomTypes: ["Bedroom"] }, collection), false)
  assert.equal(matchesMarketingCollection({ category: "Landscape", roomTypes: ["Living room"] }, collection), false)
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

test("room collection cross-links remain hidden below the shared navigation floor", () => {
  const links = [
    { href: "/collections/dining-room-wall-art", label: "Dining Room Art" },
    { href: "/collections/office-wall-art", label: "Office Wall Art" },
  ]
  assert.deepEqual(filterCatalogLinks(links, {
    visibleCollectionSlugs: ["office-wall-art"],
    visibleCategories: [],
  }).map(({ href }) => href), ["/collections/office-wall-art"])
})
