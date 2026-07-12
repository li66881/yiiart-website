import { describe, expect, it } from "vitest"
import { getArtworkDetailPreview } from "./preview"

describe("getArtworkDetailPreview", () => {
  it("returns Quiet Meridian only outside production", () => {
    expect(getArtworkDetailPreview("quiet-meridian", false)?.title).toBe("Quiet Meridian")
    expect(getArtworkDetailPreview("quiet-meridian", true)).toBeUndefined()
  })

  it("provides all four required gallery roles", () => {
    expect(getArtworkDetailPreview("quiet-meridian", false)?.gallery.map((item) => item.role))
      .toEqual(["room", "artwork", "texture", "edge"])
  })
})
