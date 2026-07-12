import { describe, expect, it } from "vitest"
import {
  buildGalleryItems,
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
      .toEqual([{ label: "Rolled Canvas" }, { label: "Stretched" }])
  })

  it("accepts only a configured option", () => {
    const options = [{ label: "Rolled Canvas" }, { label: "Stretched" }]
    expect(validatePresentationOption("Stretched", options)).toBe("Stretched")
    expect(validatePresentationOption("Gold Frame", options)).toBeUndefined()
  })
})
