import assert from "node:assert/strict"
import test from "node:test"
import { buildMerchantFeed } from "./merchant-feed"

test("merchant feed exports priced original artwork with escaped text and included US shipping", () => {
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
  ])

  assert.match(xml, /Blue &amp; Stillness/)
  assert.match(xml, /Original &lt;canvas&gt;/)
  assert.match(xml, /<g:price>100\.00 USD<\/g:price>/)
  assert.match(xml, /<g:country>US<\/g:country><g:price>0\.00 USD<\/g:price>/)
  assert.match(xml, /<g:brand>YiiArt<\/g:brand>/)
})

test("merchant feed exports priced made-to-order size and finish variants", () => {
  const xml = buildMerchantFeed([{
    _id: "made-to-order-1",
    slug: { current: "blue-sky" },
    title: { en: "Blue Sky" },
    productionModel: "hand_painted_to_order",
    shippingProfile: "Ships rolled",
    standardSizes: [
      { _key: "small", label: "50 x 75 cm", priceCny: 720 },
      { _key: "large", label: "60 x 90 cm", priceCny: 1440 },
    ],
    frameOptions: [
      { _key: "rolled", label: "Rolled canvas", priceDeltaCny: 0 },
      { _key: "framed", label: "Framed canvas", priceDeltaCny: 72 },
    ],
    cloudflareImages: [{ url: "https://assets.yiiart.com/blue-sky.webp" }],
  }])

  assert.equal((xml.match(/<item>/g) || []).length, 2)
  assert.match(xml, /<g:price>100\.00 USD<\/g:price>/)
  assert.match(xml, /<g:price>200\.00 USD<\/g:price>/)
  assert.doesNotMatch(xml, /finish=framed/)
  assert.match(xml, /<g:item_group_id>yiiart-[a-f0-9]{24}<\/g:item_group_id>/)
  assert.doesNotMatch(xml, /<g:value>Framed canvas<\/g:value>/)
})

test("merchant feed matches checkout's as-listed original price", () => {
  const xml = buildMerchantFeed([{
    _id: "framed-original",
    slug: { current: "framed-original" },
    title: { en: "Framed original" },
    price: 720,
    productionModel: "original",
    cloudflareImages: [{ url: "https://assets.yiiart.com/framed.webp" }],
  }])

  assert.match(xml, /<g:price>100\.00 USD<\/g:price>/)
})
