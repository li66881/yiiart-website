import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { buildArtistMetaDescription } from "./artist-seo"

test("artist metadata summarizes rather than publishing an unbounded biography", async () => {
  const page = await readFile("src/app/artist/[slug]/page.tsx", "utf8")

  assert.match(page, /description:\s*buildArtistMetaDescription\(/)
})

test("artist metadata preserves a useful excerpt and adds artwork discovery context", () => {
  const description = buildArtistMetaDescription(
    "Sofie Lindberg",
    "Sofie Lindberg (b. 1981, Helsingør) paints from a north-facing loft studio in Copenhagen. After studies at the Royal Danish Academy of Fine Arts, she spent several winters in Lisbon, where dry light and plaster walls still show in her palettes. Her work moves between landscape, botanical still life, and constructed texture.",
  )

  assert.ok(description.length <= 160)
  assert.ok(description.startsWith("Sofie Lindberg (b. 1981"))
  assert.ok(description.endsWith("Explore paintings by Sofie Lindberg."))
  assert.ok(description.includes("Copenhagen."))
  assert.ok(!description.includes("..."))
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
