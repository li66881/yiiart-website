import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { buildArtistMetaDescription, getPublicArtistBiography } from "./artist-seo"

test("artist metadata summarizes rather than publishing an unbounded biography", async () => {
  const page = await readFile("src/app/artist/[slug]/page.tsx", "utf8")

  assert.match(page, /description:\s*buildArtistMetaDescription\(/)
  assert.match(page, /getPublicArtistBiography\(/)
})

test("artist directory and catalog update template use the public artist biography", async () => {
  const [directory, patchCatalog] = await Promise.all([
    readFile("src/app/artists/page.tsx", "utf8"),
    readFile("src/app/api/admin/patch-catalog/route.ts", "utf8"),
  ])

  assert.match(directory, /getPublicArtistBiography\(/)
  assert.match(patchCatalog, /botanical still lifes, abstracts, and textured compositions/)
  assert.doesNotMatch(patchCatalog, /Helsingør|Royal Danish Academy|Lisbon/)
})

test("artist metadata preserves a useful excerpt and adds artwork discovery context", () => {
  const biography = getPublicArtistBiography(
    "sofie-lindberg",
    "Sofie Lindberg (b. 1981, Helsingør) paints from a north-facing loft studio in Copenhagen. After studies at the Royal Danish Academy of Fine Arts, she spent several winters in Lisbon, where dry light and plaster walls still show in her palettes. Her work moves between landscape, botanical still life, and constructed texture.",
  )
  const description = buildArtistMetaDescription("Sofie Lindberg", biography)

  assert.ok(description.length <= 160)
  assert.ok(description.startsWith("The YiiArt collection by Sofie Lindberg"))
  assert.ok(description.endsWith("Explore paintings by Sofie Lindberg."))
  assert.ok(!description.includes("Copenhagen"))
  assert.ok(!description.includes("..."))
})

test("replaces unsupported Sofie Lindberg biography claims with catalog-backed copy", () => {
  const biography = getPublicArtistBiography(
    "sofie-lindberg",
    "Sofie Lindberg (b. 1981, Helsingør) paints from a north-facing loft studio in Copenhagen. After studies at the Royal Danish Academy of Fine Arts, she spent several winters in Lisbon.",
  )

  assert.match(biography, /landscapes, botanical still lifes, abstracts, and textured compositions/i)
  assert.match(biography, /hand-painted to order/i)
  assert.doesNotMatch(biography, /1981|Helsingør|Royal Danish Academy|Lisbon|loft studio/i)
})

test("preserves biographies for other artists", () => {
  assert.equal(
    getPublicArtistBiography("huang-liang", "Contemporary painter."),
    "Contemporary painter.",
  )
})

test("short artist bios are expanded with relevant artwork discovery copy", () => {
  const description = buildArtistMetaDescription(
    "Huang Liang",
    "Contemporary Chinese artist specializing in hand-drawn artworks.",
  )

  assert.equal(
    description,
    "Contemporary Chinese artist specializing in hand-drawn artworks. Explore paintings by Huang Liang.",
  )
  assert.ok(description.length >= 90 && description.length <= 160)
})

test("missing artist bios receive useful artist-specific metadata", () => {
  assert.equal(
    buildArtistMetaDescription("Huang Liang", ""),
    "Discover Huang Liang's artist profile and browse available paintings at YiiArt.",
  )
})
