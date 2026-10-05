import assert from "node:assert/strict"
import test from "node:test"
import { access, readFile } from "node:fs/promises"
import { buildProductOfferJsonLd } from "./product-offer-schema"

test("places the artwork SKU on the Product entity", async () => {
  const artworkPage = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")

  assert.match(
    artworkPage,
    /const productJsonLd[\s\S]*?"@type": "Product",[\s\S]*?sku: artwork\.sku \|\| slug/
  )
})

test("returns a real 404 when an artwork slug is missing and propagates fetch errors", async () => {
  const [artworkPage, nextConfig] = await Promise.all([
    readFile("src/app/artwork/[slug]/page.tsx", "utf8"),
    readFile("next.config.js", "utf8"),
  ])
  assert.match(artworkPage, /import \{ notFound \} from "next\/navigation"/)
  assert.equal((artworkPage.match(/if \(!artwork\)\s*\{\s*notFound\(\)\s*\}/g) || []).length, 2)
  assert.match(artworkPage, /catch \(error\) \{\s*console\.error\("Artwork fetch error:", error\)\s*throw error\s*\}/)
  assert.match(artworkPage, /const artwork = await getArtwork\(slug\)[\s\S]*?notFound\(\)[\s\S]*?<Suspense fallback={<ArtworkPageLoading \/>}>/)
  assert.doesNotMatch(artworkPage, /product\.notFound/)
  assert.match(nextConfig, /htmlLimitedBots:[^\n]*Googlebot/i)
  assert.match(nextConfig, /htmlLimitedBots:[^\n]*Bingbot/i)
  assert.match(nextConfig, /htmlLimitedBots:[^\n]*facebookexternalhit/i)
  await assert.rejects(access("src/app/artwork/[slug]/loading.tsx"))
})

test("formats Product offer prices to the selected currency precision", async () => {
  const artworkPage = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")

  assert.match(artworkPage, /price: priceCny > 0 \? formatStoreAmount\(offerPrice, currency\) : undefined/)
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
