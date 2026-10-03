import assert from "node:assert/strict"
import test from "node:test"
import { ARTWORK_CATEGORIES } from "./artwork-categories"
import { artworkFilterGroups } from "./artwork-discovery"
import { mapCategorySitemapRoutes } from "./sitemap"

test("the public category filter and sitemap share every artwork category", () => {
  const styles = artworkFilterGroups.find((group) => group.key === "styles")
  const sitemapUrls = mapCategorySitemapRoutes("https://www.yiiart.com").map((route) => route.url)

  assert.deepEqual(styles?.options, [...ARTWORK_CATEGORIES])
  assert.equal(ARTWORK_CATEGORIES.includes("Figurative"), true)
  assert.equal(sitemapUrls.includes("https://www.yiiart.com/artworks?category=Figurative"), true)
})
