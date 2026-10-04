import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"
import { buildProductOfferJsonLd } from "./product-offer-schema"

test("places the artwork SKU on the Product entity", async () => {
  const artworkPage = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")

  assert.match(
    artworkPage,
    /const productJsonLd[\s\S]*?"@type": "Product",[\s\S]*?sku: artwork\.sku \|\| slug/
  )
})

test("builds a priced product offer without unsupported shipping or return promises", () => {
  const offer = buildProductOfferJsonLd({
    url: "https://www.yiiart.com/artwork/quiet-field",
    sku: "quiet-field",
    priceCurrency: "USD",
    price: "265.00",
    availability: "https://schema.org/InStock",
  })

  assert.deepEqual(offer, {
    "@type": "Offer",
    url: "https://www.yiiart.com/artwork/quiet-field",
    sku: "quiet-field",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    price: "265.00",
  })
  assert.equal("shippingDetails" in offer, false)
  assert.equal("hasMerchantReturnPolicy" in offer, false)
})

test("does not invent a price for a price-on-request artwork", () => {
  const offer = buildProductOfferJsonLd({
    url: "https://www.yiiart.com/artwork/quiet-field",
    sku: "quiet-field",
    priceCurrency: "USD",
    availability: "https://schema.org/LimitedAvailability",
  })

  assert.equal("price" in offer, false)
})
