import assert from "node:assert/strict"
import test from "node:test"
import { filterSitemapArtists, mapArtworkSitemapRoutes, mapArtistSitemapRoutes, mapCollectionSitemapRoutes } from "./sitemap"
import { marketingCollections } from "./collections"

const baseUrl = "https://www.yiiart.com"

test("artwork sitemap includes approved images without videos or duplicates", () => {
  const [route] = mapArtworkSitemapRoutes([{
    slug: { current: "blue-study" },
    productMedia: [
      { mediaType: "image", role: "front", url: "https://assets.yiiart.com/blue.webp", approvedForStorefront: true },
      { mediaType: "image", role: "detail", url: "https://assets.yiiart.com/blue.webp", approvedForStorefront: true },
      { mediaType: "image", url: "https://assets.yiiart.com/private.webp", approvedForStorefront: false },
      { mediaType: "video", url: "https://assets.yiiart.com/process.mp4", approvedForStorefront: true },
    ],
  }], baseUrl)
  assert.deepEqual(route.images, ["https://assets.yiiart.com/blue.webp"])
})

test("artwork sitemap uses legacy images and rejects non-HTTPS URLs", () => {
  const [route] = mapArtworkSitemapRoutes([{
    slug: { current: "legacy" },
    cloudflareImages: [{ url: "https://assets.yiiart.com/legacy.webp" }, { url: "http://example.com/image.jpg" }],
  }], baseUrl)
  assert.deepEqual(route.images, ["https://assets.yiiart.com/legacy.webp"])
})

test("invalid legacy image data does not remove the artwork URL", () => {
  const [route] = mapArtworkSitemapRoutes([{
    slug: { current: "bad-image" },
    images: [{ asset: { _ref: "invalid-image-reference" } }],
  }], baseUrl)
  assert.equal(route.url, `${baseUrl}/artwork/bad-image`)
  assert.equal("images" in route, false)
})

test("collection sitemap requires four matching public artworks for room routes", () => {
  const dining = marketingCollections.find(({ slug }) => slug === "dining-room-wall-art")!
  const office = marketingCollections.find(({ slug }) => slug === "office-wall-art")!
  const style = marketingCollections.find(({ slug }) => slug === "textured-wall-art")!
  const routes = mapCollectionSitemapRoutes([dining, office, style], [
    ...Array.from({ length: 4 }, () => ({ roomTypes: ["Dining room"] })),
    { roomTypes: ["Office"] },
  ], baseUrl)

  assert.deepEqual(routes.map(({ url }) => url), [
    `${baseUrl}/collections/dining-room-wall-art`,
    `${baseUrl}/collections/textured-wall-art`,
  ])
})

test("collection sitemap distinguishes failed inventory from successful empty inventory", () => {
  const dining = marketingCollections.find(({ slug }) => slug === "dining-room-wall-art")!
  const style = marketingCollections.find(({ slug }) => slug === "textured-wall-art")!
  for (const inventory of [null, []]) {
    const routes = mapCollectionSitemapRoutes([dining, style], inventory, baseUrl)
    assert.deepEqual(routes.map(({ url }) => url), [`${baseUrl}/collections/textured-wall-art`])
  }
})

test("artwork sitemap routes include valid slugs without unverifiable last-modified dates", () => {
  const routes = mapArtworkSitemapRoutes([
    { slug: { current: "weathered-passage" }, _updatedAt: "2026-10-04T10:00:00Z" },
    { slug: { current: "" }, _updatedAt: "2026-09-02T10:00:00Z" },
    { slug: null, _updatedAt: "2026-09-03T10:00:00Z" },
  ], baseUrl)

  assert.equal(routes.length, 1)
  assert.equal(routes[0].url, `${baseUrl}/artwork/weathered-passage`)
  assert.equal("lastModified" in routes[0], false)
})

test("artist sitemap matches public works through an exact duplicate bilingual identity", () => {
  const artists = filterSitemapArtists([
    { _id: "profile-id", slug: { current: "artist-one" }, name: { en: "Huang Liang", zh: "黄亮" } },
    { _id: "other-id", slug: { current: "artist-two" }, name: { en: "Alex Lee", zh: "李明" } },
    { _id: "legacy-id", slug: null, name: { en: "Huang Liang", zh: "黄亮" } },
  ], [{ artistRefId: "legacy-id", artist: { name: { en: "Huang Liang", zh: "黄亮" } } }])
  const routes = mapArtistSitemapRoutes(artists, baseUrl)

  assert.deepEqual(routes.map((route) => route.url), [`${baseUrl}/artist/artist-one`])
})

test("artist sitemap routes also omit unrelated CMS update times", () => {
  const routes = mapArtworkSitemapRoutes([
    { slug: { current: "no-date" }, _updatedAt: undefined },
    { slug: { current: "bad-date" }, _updatedAt: "not-a-date" },
  ], baseUrl)

  assert.equal(routes.length, 2)
  assert.equal("lastModified" in routes[0], false)
  assert.equal("lastModified" in routes[1], false)

  const artists = mapArtistSitemapRoutes([
    { _id: "artist-1", slug: { current: "artist-one" }, _updatedAt: "2026-10-04T00:00:00Z", name: { en: "Artist One" } },
  ], baseUrl)
  assert.equal("lastModified" in artists[0], false)
})
