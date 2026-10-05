import assert from "node:assert/strict"
import test from "node:test"
import { buildArtworkSeoTitle } from "./artwork-display"

test("builds concise English artwork titles around the artwork name and category", () => {
  const title = buildArtworkSeoTitle({ title: { en: "Dawn Peak" }, category: "Landscape" })

  assert.equal(
    title,
    "Dawn Peak | Landscape Painting",
  )
  assert.ok(`${title} | YiiArt`.length <= 60)
})

test("uses readable category phrases for artwork search titles", () => {
  assert.equal(buildArtworkSeoTitle({ title: { en: "Sage Labyrinth" }, category: "Texture" }), "Sage Labyrinth | Textured Wall Art")
  assert.equal(buildArtworkSeoTitle({ title: { en: "Quiet Geometry" }, category: "Minimalist" }), "Quiet Geometry | Minimalist Painting")
  assert.equal(buildArtworkSeoTitle({ title: { en: "Studio Work" } }), "Studio Work | Original Artwork")
})
