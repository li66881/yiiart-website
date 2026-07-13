import { describe, expect, it } from "vitest"
import { getArtworkDetailPreview, isArtworkPreviewDisabled } from "./preview"

describe("getArtworkDetailPreview", () => {
  it("returns Quiet Meridian only outside production", () => {
    const preview = getArtworkDetailPreview("quiet-meridian", false)
    expect(preview?.title).toBe("Quiet Meridian")
    expect(preview?.certificateIncluded).toBe(true)
    expect(preview?.presentationOptions.every((option) => option.description)).toBe(true)
    expect(getArtworkDetailPreview("quiet-meridian", true)).toBeUndefined()
  })

  it("provides all four required gallery roles", () => {
    expect(getArtworkDetailPreview("quiet-meridian", false)?.gallery.map((item) => item.role))
      .toEqual(["room", "artwork", "texture", "edge"])
  })

  it("keeps production disabled unless an explicit local QA flag is set", () => {
    expect(isArtworkPreviewDisabled(true, undefined)).toBe(true)
    expect(isArtworkPreviewDisabled(true, "1")).toBe(false)
    expect(isArtworkPreviewDisabled(false, undefined)).toBe(false)
  })

  it("includes a real thumbnail for every preview presentation choice", () => {
    expect(getArtworkDetailPreview("quiet-meridian", false)?.presentationOptions.every((option) => option.image))
      .toBe(true)
  })
})
