import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("natural studio page composition", () => {
  it("places visually similar artwork before the material story", () => {
    const source = readFileSync("src/app/artwork/[slug]/page.tsx", "utf8")
    const similarIndex = source.indexOf("<ArtworkSimilarStrip")
    expect(similarIndex).toBeGreaterThan(-1)
    expect(similarIndex).toBeLessThan(source.indexOf("<ArtworkMaterialStory"))
  })

  it("queries the optional certificate fact", () => {
    const source = readFileSync("src/app/artwork/[slug]/page.tsx", "utf8")
    expect(source).toContain("certificateIncluded")
  })
})
