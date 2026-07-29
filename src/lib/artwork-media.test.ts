import assert from "node:assert/strict"
import test from "node:test"
import {
  buildProductGalleryMedia,
  getApprovedProductImageUrls,
  getApprovedProductMedia,
} from "./artwork-media"

test("sorts approved product media by explicit order and storefront role", () => {
  const artwork = {
    productMedia: [
      { _key: "room", mediaType: "image", role: "living_room", url: "https://assets.yiiart.com/room.webp", approvedForStorefront: true },
      { _key: "video", mediaType: "video", role: "process", url: "https://assets.yiiart.com/process.mp4", posterUrl: "https://assets.yiiart.com/poster.webp", approvedForStorefront: true },
      { _key: "front", mediaType: "image", role: "front", url: "https://assets.yiiart.com/front.webp", approvedForStorefront: true },
      { _key: "hidden", mediaType: "image", role: "detail", url: "https://assets.yiiart.com/hidden.webp", approvedForStorefront: false },
    ],
  }

  const media = getApprovedProductMedia(artwork)

  assert.deepEqual(media.map((item) => item.id), ["front", "video", "room"])
  assert.equal(media[1].type, "video")
  assert.equal(media[1].posterUrl, "https://assets.yiiart.com/poster.webp")
  assert.deepEqual(getApprovedProductImageUrls(artwork), [
    "https://assets.yiiart.com/front.webp",
    "https://assets.yiiart.com/room.webp",
  ])
})

test("keeps legacy image galleries working when audited media is absent", () => {
  const media = buildProductGalleryMedia(
    {},
    ["https://assets.yiiart.com/main.webp", "https://assets.yiiart.com/detail.webp"],
    "Blue handmade painting",
  )

  assert.equal(media.length, 2)
  assert.equal(media[0].role, "front")
  assert.equal(media[1].role, "original")
  assert.equal(media[1].alt, "Blue handmade painting, view 2")
})
