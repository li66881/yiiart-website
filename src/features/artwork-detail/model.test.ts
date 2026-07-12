import { describe, expect, it } from "vitest"
import {
  buildArtworkProductTags,
  buildGalleryItems,
  getPresentationDescription,
  normalizePresentationOptions,
  validatePresentationOption,
} from "./model"

describe("buildGalleryItems", () => {
  it("keeps explicit roles and removes duplicate URLs", () => {
    expect(buildGalleryItems({
      title: "Quiet Meridian",
      explicit: [
        { url: "/room.webp", role: "room", alt: "Room visualization" },
        { url: "/artwork.webp", role: "artwork", alt: "Full artwork" },
        { url: "/room.webp", role: "texture", alt: "Duplicate" },
        { url: "/invalid-role.webp", role: "promotion" as never, alt: "Invalid role" },
      ],
      fallbackUrls: ["/legacy.webp"],
    })).toEqual([
      { url: "/room.webp", role: "room", alt: "Room visualization", isVisualization: true },
      { url: "/artwork.webp", role: "artwork", alt: "Full artwork", isVisualization: false },
      { url: "/invalid-role.webp", role: "artwork", alt: "Invalid role", isVisualization: false },
    ])
  })

  it("uses legacy images when explicit gallery data is empty", () => {
    expect(buildGalleryItems({
      title: "Afternoon",
      explicit: [],
      fallbackUrls: ["/one.jpg", "/two.jpg"],
    })).toEqual([
      { url: "/one.jpg", role: "artwork", alt: "Afternoon, full artwork view", isVisualization: false },
      { url: "/two.jpg", role: "texture", alt: "Afternoon, detail view 2", isVisualization: false },
    ])
  })
})

describe("presentation options", () => {
  it("trims, removes blanks, and deduplicates case-insensitively", () => {
    expect(normalizePresentationOptions([" Rolled Canvas ", "", "rolled canvas", "Stretched"]))
      .toEqual([
        { label: "Rolled Canvas", description: "Ships rolled in a protective tube" },
        { label: "Stretched", description: "Ready to hang" },
      ])
  })

  it("accepts only a configured option", () => {
    const options = [{ label: "Rolled Canvas" }, { label: "Stretched" }]
    expect(validatePresentationOption("Stretched", options)).toBe("Stretched")
    expect(validatePresentationOption("Gold Frame", options)).toBeUndefined()
  })
})

describe("natural studio product content", () => {
  it("shows only truthful product tags", () => {
    expect(buildArtworkProductTags({
      medium: "Mixed media on canvas",
      surfaceFinish: "Raised plaster texture",
      certificateIncluded: false,
      previewMode: false,
    })).toEqual([
      { label: "Original Artwork" },
      { label: "Hand-Painted Texture" },
    ])
  })

  it("allows the certificate tag only from configured or preview facts", () => {
    expect(buildArtworkProductTags({ certificateIncluded: true, previewMode: false }))
      .toContainEqual({ label: "Certificate Included" })
    expect(buildArtworkProductTags({ certificateIncluded: false, previewMode: true }))
      .toContainEqual({ label: "Certificate Included" })
  })

  it("returns safe supporting copy for known presentation labels", () => {
    expect(getPresentationDescription("Rolled Canvas"))
      .toBe("Ships rolled in a protective tube")
    expect(getPresentationDescription("Stretched"))
      .toBe("Ready to hang")
    expect(getPresentationDescription("Natural Oak Float Frame"))
      .toBe("Warm oak frame with a float mount")
    expect(getPresentationDescription("Custom format")).toBeUndefined()
  })
})
