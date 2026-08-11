import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("optimized storefront keeps current catalog and checkout boundaries", async () => {
  const home = await readFile("src/app/page.tsx", "utf8")
  const product = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")
  const checkout = await readFile("src/lib/checkout.ts", "utf8")
  assert.match(home, /PUBLIC_ARTWORK_GROQ_FILTER/)
  assert.match(product, /isArtworkCheckoutAvailable/)
  assert.match(checkout, /resolveCheckoutSelection/)
  assert.match(checkout, /shippingProfile/)
})

test("optimized storefront contains no stale hard-coded promotion", async () => {
  const sources = await Promise.all([
    "src/components/HeroSection.tsx",
    "src/components/home/EditorialHome.tsx",
    "src/components/storefront/ProductPurchasePanel.tsx",
  ].map((file) => readFile(file, "utf8")))
  assert.doesNotMatch(sources.join("\n"), /40% off|sale ends in|only \d+ left/i)
})

test("public copy validation rejects stale optimized-branch claims", async () => {
  const copyCheck = await readFile("scripts/check-public-copy.mjs", "utf8")
  assert.match(copyCheck, /40% off/)
  assert.match(copyCheck, /free replacement or a full refund/)
  assert.match(copyCheck, /arrive 5-10 business days later/)
})

test("optimized storefront restores the global shell and homepage composition", async () => {
  const headerClient = await readFile("src/components/HeaderClient.tsx", "utf8")
  const hero = await readFile("src/components/HeroSection.tsx", "utf8")
  const editorialHome = await readFile("src/components/home/EditorialHome.tsx", "utf8")

  assert.match(headerClient, /optimized-storefront-header/)
  assert.match(hero, /type HeroSlide/)
  assert.match(hero, /aria-label="Previous slide"/)
  assert.match(hero, /aria-label="Next slide"/)
  assert.match(hero, /Pause carousel/)
  assert.match(hero, /prefers-reduced-motion/)
  assert.match(editorialHome, /Shop by room/)
  assert.match(editorialHome, /Shop by style/)
  assert.match(editorialHome, /Custom painting/)
  assert.match(headerClient, /meson-primary-navigation/)
  assert.match(headerClient, /meson-category-navigation/)
  assert.match(editorialHome, /Best Sellers/)
  assert.match(editorialHome, /room=Dining%20Room/)
  assert.match(editorialHome, /room=Office/)
  assert.match(editorialHome, /color=Black/)
})

test("optimized storefront restores artwork and collection discovery", async () => {
  const discoveryGrid = await readFile("src/components/ArtworkDiscoveryGrid.tsx", "utf8")
  const storefrontControls = await readFile("src/components/StorefrontControls.tsx", "utf8")
  const collectionCopy = await readFile("src/components/StorefrontCollectionCopy.tsx", "utf8")
  const collectionPage = await readFile("src/app/collections/[slug]/page.tsx", "utf8")
  const artworksPage = await readFile("src/app/artworks/page.tsx", "utf8")

  assert.match(discoveryGrid, /optimized-product-grid/)
  assert.match(discoveryGrid, /meson-discovery-toolbar/)
  assert.match(discoveryGrid, /meson-product-card/)
  assert.match(discoveryGrid, /Choose options/)
  assert.match(discoveryGrid, /aria-label="Sort artworks"/)
  assert.match(storefrontControls, /border-stone-300/)
  assert.match(collectionCopy, /optimized-collection-card/)
  assert.match(collectionPage, /optimized-collection-page/)
  assert.match(artworksPage, /PUBLIC_ARTWORK_GROQ_FILTER/)
})

test("optimized storefront restores product detail presentation", async () => {
  const productGallery = await readFile("src/components/storefront/ProductGallery.tsx", "utf8")
  const purchasePanel = await readFile("src/components/storefront/ProductPurchasePanel.tsx", "utf8")
  const artworkPage = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")

  assert.match(productGallery, /aria-label="Artwork gallery"/)
  assert.match(productGallery, /dining_room/)
  assert.match(productGallery, /event\.key === "Tab"/)
  assert.match(productGallery, /previouslyFocused\.focus/)
  assert.match(purchasePanel, /optimized-purchase-panel/)
  assert.match(artworkPage, /isArtworkCheckoutAvailable/)
  assert.match(artworkPage, /buildProductDetailCopy/)
})

test("complete recovery matches the approved MesonArt-aligned composition", async () => {
  const [header, hero, gallery, purchase, styles] = await Promise.all([
    readFile("src/components/HeaderClient.tsx", "utf8"),
    readFile("src/components/HeroSection.tsx", "utf8"),
    readFile("src/components/storefront/ProductGallery.tsx", "utf8"),
    readFile("src/components/storefront/ProductPurchasePanel.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])

  assert.match(header, /meson-primary-navigation/)
  assert.match(header, /meson-category-navigation/)
  assert.match(hero, /meson-hero-shell/)
  assert.match(gallery, /meson-gallery-thumbnails/)
  assert.match(purchase, /meson-purchase-stack/)
  assert.match(styles, /\.mesonProductLayout/)
})

test("optimized storefront restores cart presentation without changing checkout", async () => {
  const cartPage = await readFile("src/app/cart/page.tsx", "utf8")

  assert.match(cartPage, /optimized-cart-layout/)
  assert.match(cartPage, /useCart/)
  assert.doesNotMatch(cartPage, /api\/webhooks|stripe\.checkout/i)
})
