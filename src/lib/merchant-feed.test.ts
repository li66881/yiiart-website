import assert from "node:assert/strict"
import test from "node:test"
import { buildMerchantFeed } from "./merchant-feed"

test("merchant feed exports eligible originals with escaped text and included US shipping", () => {
  const xml = buildMerchantFeed([
    {
      _id: "original-1",
      slug: { current: "blue-stillness" },
      title: { en: "Blue & Stillness" },
      shortDescription: { en: "Original <canvas>" },
      price: 720,
      productionModel: "original",
      availability: "available",
      cloudflareImages: [{ url: "https://assets.yiiart.com/blue.webp" }],
    },
    {
      _id: "made-to-order-1",
      slug: { current: "reproduction" },
      title: { en: "Reproduction" },
      price: 720,
      productionModel: "hand_painted_to_order",
      cloudflareImages: [{ url: "https://assets.yiiart.com/copy.webp" }],
    },
  ])

  assert.match(xml, /Blue &amp; Stillness/)
  assert.match(xml, /Original &lt;canvas&gt;/)
  assert.match(xml, /<g:price>100\.00 USD<\/g:price>/)
  assert.match(xml, /<g:country>US<\/g:country><g:price>0\.00 USD<\/g:price>/)
  assert.doesNotMatch(xml, /made-to-order-1/)
})
