import assert from "node:assert/strict"
import test from "node:test"
import { ARTWORK_CATEGORIES } from "./artwork-categories"
import { buildArtworkCategorySeoMetadata, getArtworkCategorySeo } from "./artwork-category-seo"

test("every sitemap artwork category has distinct, natural English metadata", () => {
  const pages = ARTWORK_CATEGORIES.map((category) => getArtworkCategorySeo(category))

  assert.equal(pages.every(Boolean), true)
  assert.equal(new Set(pages.map((page) => page?.title)).size, ARTWORK_CATEGORIES.length)
  assert.equal(new Set(pages.map((page) => page?.description)).size, ARTWORK_CATEGORIES.length)
  assert.equal(getArtworkCategorySeo("Texture")?.title, "Textured Wall Art & Paintings")
  assert.equal(getArtworkCategorySeo("Landscape")?.title, "Landscape Paintings")
})

test("category resolution is case-insensitive and rejects unknown URL values", () => {
  assert.equal(getArtworkCategorySeo(" texture ")?.category, "Texture")
  assert.equal(getArtworkCategorySeo("made-up-category"), undefined)
})

test("only recognized category filters get indexable category canonicals", () => {
  assert.deepEqual(buildArtworkCategorySeoMetadata("Texture"), {
    category: "Texture",
    title: "Textured Wall Art & Paintings",
    description: getArtworkCategorySeo("Texture")?.description,
    path: "/artworks?category=Texture",
    robots: undefined,
  })

  const unknownCategory = buildArtworkCategorySeoMetadata("unknown-style")
  assert.equal(unknownCategory.path, "/artworks")
  assert.deepEqual(unknownCategory.robots, { index: false, follow: true })
})
