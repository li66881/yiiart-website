import { describe, expect, it } from "vitest"
import { getArtworkGalleryItems } from "./artwork-images"

describe("getArtworkGalleryItems", () => {
  it("prefers explicit URL assets with roles", () => {
    expect(getArtworkGalleryItems({
      galleryAssets: [
        { role: "room", url: "https://assets.yiiart.com/room.webp", alt: "Room visualization" },
        { role: "artwork", url: "https://assets.yiiart.com/artwork.webp", alt: "Full artwork" },
      ],
      cloudflareImages: [{ url: "https://assets.yiiart.com/legacy.webp" }],
    }, {}, "Quiet Meridian")).toEqual([
      {
        url: "https://assets.yiiart.com/room.webp",
        role: "room",
        alt: "Room visualization",
        isVisualization: true,
      },
      {
        url: "https://assets.yiiart.com/artwork.webp",
        role: "artwork",
        alt: "Full artwork",
        isVisualization: false,
      },
    ])
  })
})
