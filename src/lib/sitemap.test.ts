import assert from "node:assert/strict"
import test from "node:test"
import { filterSitemapArtists, mapArtworkSitemapRoutes, mapArtistSitemapRoutes } from "./sitemap"

const baseUrl = "https://www.yiiart.com"

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
