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

test("keeps listing photos when only a hang-on-wall video is approved", () => {
  const media = buildProductGalleryMedia(
    {
      productMedia: [{
        _key: "hang",
        mediaType: "video",
        role: "process",
        url: "https://assets.yiiart.com/hang.mp4",
        posterUrl: "https://assets.yiiart.com/poster.jpg",
        approvedForStorefront: true,
      }],
    },
    ["https://assets.yiiart.com/main.jpg", "https://assets.yiiart.com/detail.jpg"],
    "Dawn Peak painting",
  )

  assert.equal(media.length, 4)
  assert.equal(media[0].type, "image")
  assert.equal(media[0].url, "https://assets.yiiart.com/main.jpg")
  assert.equal(media[1].url, "https://assets.yiiart.com/poster.jpg")
  assert.equal(media[1].role, "living_room")
  assert.equal(media[2].url, "https://assets.yiiart.com/detail.jpg")
  assert.equal(media[3].type, "video")
  assert.equal(media[3].url, "https://assets.yiiart.com/hang.mp4")
})

test("keeps a dining-room scene distinct from a generic additional view", () => {
  const media = getApprovedProductMedia({
    productMedia: [{
      _key: "dining",
      mediaType: "image",
      role: "dining_room",
      url: "https://assets.yiiart.com/dining.webp",
      approvedForStorefront: true,
    }],
  })

  assert.equal(media[0].role, "dining_room")
})

test("puts room scenes after the studio photo and keeps video last", () => {
  const media = buildProductGalleryMedia(
    {
      productMedia: [
        { _key: "front", mediaType: "image", role: "front", url: "https://cdn.sanity.io/images/zlh03v8i/production/front-1024x1536.jpg", approvedForStorefront: true },
        { _key: "video", mediaType: "video", role: "process", url: "https://assets.yiiart.com/hang.mp4", posterUrl: "https://assets.yiiart.com/poster.jpg", approvedForStorefront: true },
        { _key: "scene-a", mediaType: "image", role: "detail", url: "https://cdn.sanity.io/images/zlh03v8i/production/scene-a-1536x1024.jpg", approvedForStorefront: true },
        { _key: "scene-b", mediaType: "image", role: "detail", url: "https://cdn.sanity.io/images/zlh03v8i/production/scene-b-1536x1024.jpg", approvedForStorefront: true },
      ],
    },
    [],
    "Dawn Peak painting",
  )

  assert.deepEqual(media.map((item) => item.id), ["front", "scene-a", "scene-b", "video"])
  assert.equal(media[1].type, "image")
  assert.equal(media[3].type, "video")
})
