import assert from "node:assert/strict"
import test from "node:test"
import { siteAssetUrl } from "./assets"

test("keeps essential brand assets on the YiiArt origin", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
  process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL = "https://assets.yiiart.com"

  try {
    assert.equal(siteAssetUrl("/brand/yiiart-logo-light.svg"), "/brand/yiiart-logo-light.svg")
    assert.equal(siteAssetUrl("/flags/us.svg"), "/flags/us.svg")
    assert.equal(siteAssetUrl("/favicon.svg"), "/favicon.svg")
    assert.equal(siteAssetUrl("/uploads/room-scene.jpg"), "https://assets.yiiart.com/uploads/room-scene.jpg")
  } finally {
    process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL = originalBaseUrl
  }
})
