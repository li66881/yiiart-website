import assert from "node:assert/strict"
import test from "node:test"
import { filterSitemapArtists, mapArtworkSitemapRoutes, mapArtistSitemapRoutes } from "./sitemap"

const baseUrl = "https://www.yiiart.com"

test("artwork sitemap routes use valid slugs and CMS update times", () => {
  const routes = mapArtworkSitemapRoutes([
    { slug: { current: "weathered-passage" }, _updatedAt: "2026-09-01T10:00:00Z" },
    { slug: { current: "" }, _updatedAt: "2026-09-02T10:00:00Z" },
    { slug: null, _updatedAt: "2026-09-03T10:00:00Z" },
  ], baseUrl)

  assert.equal(routes.length, 1)
  assert.equal(routes[0].url, `${baseUrl}/artwork/weathered-passage`)
  assert.equal(routes[0].lastModified?.toISOString(), "2026-09-01T10:00:00.000Z")
})

test("artist sitemap includes only slugged artists with publicly visible artworks", () => {
  const artists = filterSitemapArtists([
    { slug: { current: "artist-one" } },
    { slug: { current: "artist-two" } },
    { slug: null },
  ], ["artist-one"])
  const routes = mapArtistSitemapRoutes(artists, baseUrl)

  assert.deepEqual(routes.map((route) => route.url), [`${baseUrl}/artist/artist-one`])
})

test("invalid or absent CMS dates do not become fabricated current timestamps", () => {
  const routes = mapArtworkSitemapRoutes([
    { slug: { current: "no-date" }, _updatedAt: undefined },
    { slug: { current: "bad-date" }, _updatedAt: "not-a-date" },
  ], baseUrl)

  assert.equal(routes.length, 2)
  assert.equal(routes[0].lastModified, undefined)
  assert.equal(routes[1].lastModified, undefined)
})
