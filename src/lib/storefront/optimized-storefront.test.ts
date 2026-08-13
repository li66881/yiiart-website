import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import {
  applyCookieConsentBodyState,
  clearCookieConsentBodyState,
} from "../cookie-consent-state"
import { buildProductFinishSelectorViewModel } from "./finish-selector"
import type { NormalizedFinishOption } from "./finish-options"
import {
  buildProductDetailContentModel,
  productDetailStoryLayout,
} from "./product-detail-information"
import { bindPurchaseAction, purchaseTrustLabel } from "./purchase-action"
import { mainActionBlocksSticky, shouldShowStickyPurchase } from "./sticky-purchase"
import { productDetailNavigationItems } from "./product-detail-navigation"
import { buildProductGalleryLabelModel } from "./product-gallery-labels"

const selectorFinishes: NormalizedFinishOption[] = [
  {
    id: "rolled",
    label: "Rolled canvas",
    pricing: { kind: "fixed_delta", priceDeltaCny: 0 },
    assetSrc: "/images/product-finishes/rolled-canvas.webp",
    assetAlt: "Rolled canvas",
  },
  {
    id: "black-frame",
    label: "Black float frame",
    pricing: { kind: "catalog_formula", presentationId: "black-frame" },
    assetSrc: "/images/product-finishes/black-float-frame.webp",
    assetAlt: "Black float frame",
  },
]

function createCookieBodyTarget() {
  const properties = new Map<string, string>()
  return {
    properties,
    target: {
      dataset: {} as { cookieConsentVisible?: string },
      style: {
        setProperty(name: string, value: string) {
          properties.set(name, value)
        },
        removeProperty(name: string) {
          properties.delete(name)
        },
      },
    },
  }
}

test("finish selector exposes the active presentation and only positive price increments", () => {
  const viewModel = buildProductFinishSelectorViewModel(selectorFinishes, 1730, "black-frame")

  assert.equal(viewModel.selectedLabel, "Black float frame")
  assert.deepEqual(viewModel.choices.map(({ id, selected, priceDeltaCny }) => ({
    id,
    selected,
    priceDeltaCny,
  })), [
    { id: "rolled", selected: false, priceDeltaCny: null },
    { id: "black-frame", selected: true, priceDeltaCny: 1360 },
  ])
})

test("finish selector recalculates presentation increments when the rolled size price changes", () => {
  const small = buildProductFinishSelectorViewModel(selectorFinishes, 1730, "black-frame")
  const large = buildProductFinishSelectorViewModel(selectorFinishes, 3120, "black-frame")

  assert.equal(small.selectedLabel, "Black float frame")
  assert.equal(large.selectedLabel, "Black float frame")
  assert.equal(small.choices[1].priceDeltaCny, 1360)
  assert.equal(large.choices[1].priceDeltaCny, 2450)
})

test("finish selector keeps native radio semantics and distinguishable focus and selected states", async () => {
  const [selector, styles] = await Promise.all([
    readFile("src/components/storefront/ProductFinishSelector.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])

  assert.match(selector, /<fieldset/)
  assert.match(selector, /<legend>Choose a presentation<\/legend>/)
  assert.match(selector, /type="radio"/)
  assert.match(selector, /alt=""/)
  assert.match(selector, /data-selected=/)
  assert.match(styles, /\.finishRadio:focus-visible \+ \.finishControl/)
  assert.match(styles, /\.finishChoice\[data-selected="true"\]/)
})

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
  const bestSellerTabs = await readFile("src/components/home/BestSellerTabs.tsx", "utf8")

  assert.match(headerClient, /optimized-storefront-header/)
  assert.match(hero, /type HeroSlide/)
  assert.match(hero, /aria-label="Previous slide"/)
  assert.match(hero, /aria-label="Next slide"/)
  assert.match(hero, /Pause carousel/)
  assert.match(hero, /prefers-reduced-motion/)
  assert.match(editorialHome, /Shop by room/)
  assert.match(editorialHome, /Shop By Popular/)
  assert.match(editorialHome, /Custom painting/)
  assert.match(headerClient, /common.openMenu/)
  assert.match(bestSellerTabs, /Best Seller/)
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
  assert.match(productGallery, /aria-label="Open image viewer"/)
  assert.match(productGallery, /dining_room/)
  assert.match(productGallery, /event\.key === "Tab"/)
  assert.match(productGallery, /previouslyFocused\.focus/)
  assert.match(purchasePanel, /optimized-purchase-panel/)
  assert.match(purchasePanel, /meson-purchase-stack/)
  assert.doesNotMatch(purchasePanel, /people saved this|sold in last|shipping and tariffs included/i)
  assert.match(artworkPage, /isArtworkCheckoutAvailable/)
  assert.match(artworkPage, /buildProductDetailCopy/)
  assert.match(artworkPage, /mesonProductLayout/)
})

test("gallery labels expose the current role and disambiguate repeated role views", () => {
  const labels = buildProductGalleryLabelModel(
    ["front", "detail", "detail"],
    2,
  )

  assert.equal(labels.visibleLabel, "Texture detail")
  assert.deepEqual(labels.thumbnailLabels, [
    "Show front view",
    "Show texture detail, view 2",
    "Show texture detail, view 3",
  ])
  assert.equal(new Set(labels.thumbnailLabels).size, labels.thumbnailLabels.length)
})

test("product layout keeps the gallery dominant and stacks safely across narrow viewports", async () => {
  const [gallery, styles] = await Promise.all([
    readFile("src/components/storefront/ProductGallery.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])
  const tabletLayout = styles.slice(
    styles.indexOf("@media (max-width: 1023px)"),
    styles.indexOf("@media (max-width: 760px)"),
  )

  assert.match(gallery, /aria-live="polite"[^>]*>\s*{galleryLabels\.visibleLabel}/)
  assert.match(gallery, /aria-label={galleryLabels\.thumbnailLabels\[index\]}/)
  assert.match(styles, /\.mesonProductLayout\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*3fr\)\s+minmax\(360px,\s*2fr\)/)
  assert.match(styles, /\.purchasePanel\s*{[^}]*position:\s*sticky;[^}]*top:\s*calc\(var\(--yiiart-header-offset\) \+ 24px\)/)
  assert.match(styles, /@media \(max-width: 1023px\)[\s\S]*?\.purchasePanel\s*{[^}]*position:\s*static/)
  assert.match(styles, /@media \(max-width: 900px\)[\s\S]*?\.thumbnailGrid\s*{[^}]*overflow-x:\s*auto;[^}]*flex-direction:\s*row/)
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.productDetailNavigation\s*{[^}]*width:\s*calc\(100% \+ 2rem\);[^}]*max-width:\s*100vw/)
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.finishGrid\s*{[^}]*overflow-x:\s*auto;[\s\S]*?\.finishName\s*{[^}]*display:\s*block/)
  assert.match(styles, /\.productDetailNavigation a\s*{[^}]*min-height:\s*44px/)
  assert.match(styles, /\.galleryArrow,[\s\S]*?width:\s*44px;[^}]*height:\s*44px/)
  assert.match(styles, /\.quantityControl\s*{[^}]*grid-template-columns:\s*44px 42px 44px;[^}]*height:\s*44px/)
  assert.match(tabletLayout, /:global\(body\):has\(\.stickyPurchaseShell\)\s*{[^}]*padding-bottom:\s*calc\(96px \+ env\(safe-area-inset-bottom\)\)/)
  assert.match(tabletLayout, /:global\(body\[data-cookie-consent-visible="true"\]\):has\(\.stickyPurchaseShell\)\s*{[^}]*padding-bottom:\s*calc\(96px \+ var\(--cookie-consent-height, 0px\) \+ env\(safe-area-inset-bottom\)\)/)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.stickyPurchaseShell\s*{[^}]*animation:\s*none/)
})

test("product information navigation exposes the four detail groups in reading order", () => {
  assert.deepEqual(productDetailNavigationItems, [
    { id: "about-artwork", label: "About the artwork" },
    { id: "details-customization", label: "Details & customization" },
    { id: "shipping-returns", label: "Shipping & returns" },
    { id: "reviews", label: "Reviews" },
  ])
})

test("artwork page integrates the product information navigation and anchored regions", async () => {
  const artworkPage = await readFile("src/app/artwork/[slug]/page.tsx", "utf8")

  assert.match(artworkPage, /ProductDetailNavigation/)
  assert.match(artworkPage, /id="about-artwork"/)
  assert.match(artworkPage, /id="details-customization"/)
  assert.match(artworkPage, /id="shipping-returns"/)
  assert.match(artworkPage, /id="reviews"/)
  assert.doesNotMatch(artworkPage, /&larr;[^\n]*product\.backToArtworks/)
})

test("product information story layout expands when no editorial media is available", () => {
  assert.equal(productDetailStoryLayout(true), "with-media")
  assert.equal(productDetailStoryLayout(false), "text-only")
})

test("consolidated product details retain framing notes once and remove repeated advice", () => {
  const model = buildProductDetailContentModel({
    framingNotes: " Ships rolled; framing can be discussed. ",
    adviceItems: [
      { id: "room-fit", title: "Room fit", text: "Repeated by scale guidance." },
      { id: "framing", title: "Framing", text: "Repeated by presentation guidance." },
      { id: "color-confidence", title: "Color confidence", text: "Request daylight photos." },
      { id: "care", title: "Care", text: "Keep away from direct moisture." },
    ],
  })

  assert.equal(model.presentationNote, "Ships rolled; framing can be discussed.")
  assert.deepEqual(model.supplementalAdvice, [
    { id: "color-confidence", title: "Color confidence", text: "Request daylight photos.", translationIndex: 2 },
    { id: "care", title: "Care", text: "Keep away from direct moisture.", translationIndex: 3 },
  ])
})

test("artwork story applies the text-only layout modifier when media is absent", async () => {
  const [artworkPage, styles] = await Promise.all([
    readFile("src/app/artwork/[slug]/page.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])

  assert.match(artworkPage, /productDetailStoryLayout\(Boolean\(editorialMedia\)\)/)
  assert.match(artworkPage, /productDetailStoryGridTextOnly/)
  assert.match(styles, /\.productDetailStoryGridTextOnly\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*680px\)/)
})

test("product purchase hierarchy shares the selected total and sticky action state", async () => {
  const purchasePanel = await readFile("src/components/storefront/ProductPurchasePanel.tsx", "utf8")

  assert.match(purchasePanel, /Add to Cart —/)
  assert.match(purchasePanel, /ProductStickyPurchaseBar/)
  assert.match(purchasePanel, /mainAction(?:Ref|Sentinel)/)
})

test("sticky purchase visibility requires a selection and an unobscured offscreen action", () => {
  assert.equal(mainActionBlocksSticky({ isIntersecting: true, top: 0 }), true)
  assert.equal(mainActionBlocksSticky({ isIntersecting: false, top: 480 }), true)
  assert.equal(mainActionBlocksSticky({ isIntersecting: false, top: -1 }), false)
  assert.equal(shouldShowStickyPurchase({
    hasSelection: true,
    actionVisible: false,
    footerVisible: false,
  }), true)
  assert.equal(shouldShowStickyPurchase({
    hasSelection: true,
    actionVisible: true,
    footerVisible: false,
  }), false)
  assert.equal(shouldShowStickyPurchase({
    hasSelection: false,
    actionVisible: false,
    footerVisible: false,
  }), false)
  assert.equal(shouldShowStickyPurchase({
    hasSelection: true,
    actionVisible: false,
    footerVisible: true,
  }), false)
})

test("desktop sticky purchase aligns with the artwork page container and gutters", async () => {
  const [artworkPage, styles] = await Promise.all([
    readFile("src/app/artwork/[slug]/page.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])

  assert.match(artworkPage, /max-w-\[1600px\] px-4[^"\n]*sm:px-6[^"\n]*lg:px-8/)
  assert.match(styles, /width: min\(100%, 1600px\)/)
  assert.match(styles, /\.stickyPurchaseShell\s*{[^}]*padding-inline: 16px/)
  assert.match(styles, /@media \(min-width: 640px\)[\s\S]*?\.stickyPurchaseShell\s*{[^}]*padding-inline: 24px/)
  assert.match(styles, /@media \(min-width: 1024px\)[\s\S]*?\.stickyPurchaseShell\s*{[^}]*padding-inline: 32px/)
})

test("purchase trust copy matches the product production model", () => {
  assert.equal(purchaseTrustLabel(true), "Hand-painted to order")
  assert.equal(purchaseTrustLabel(false), "Original artwork")
})

test("cookie consent body state is visible only until dismissal or unmount", () => {
  const dismissed = createCookieBodyTarget()
  applyCookieConsentBodyState(dismissed.target, 86.2)
  assert.equal(dismissed.target.dataset.cookieConsentVisible, "true")
  assert.equal(dismissed.properties.get("--cookie-consent-height"), "87px")
  clearCookieConsentBodyState(dismissed.target)
  assert.equal(dismissed.target.dataset.cookieConsentVisible, undefined)
  assert.equal(dismissed.properties.has("--cookie-consent-height"), false)

  const unmounted = createCookieBodyTarget()
  const cleanup = applyCookieConsentBodyState(unmounted.target, 64)
  cleanup()
  assert.equal(unmounted.target.dataset.cookieConsentVisible, undefined)
  assert.equal(unmounted.properties.has("--cookie-consent-height"), false)
})

test("main and sticky buttons invoke one shared cart action", () => {
  let payloadConstructions = 0
  const cartLines: Array<{ priceCny: number; quantity: number }> = []
  const addSelection = () => {
    payloadConstructions += 1
    cartLines.push({ priceCny: 2710, quantity: 2 })
  }
  const bindings = bindPurchaseAction(addSelection)

  assert.strictEqual(bindings.main, bindings.sticky)
  bindings.main()
  bindings.sticky()
  assert.equal(payloadConstructions, 2)
  assert.deepEqual(cartLines, [
    { priceCny: 2710, quantity: 2 },
    { priceCny: 2710, quantity: 2 },
  ])
})

test("complete recovery matches the approved MesonArt-aligned composition", async () => {
  const [header, hero, gallery, purchase, styles] = await Promise.all([
    readFile("src/components/HeaderClient.tsx", "utf8"),
    readFile("src/components/HeroSection.tsx", "utf8"),
    readFile("src/components/storefront/ProductGallery.tsx", "utf8"),
    readFile("src/components/storefront/ProductPurchasePanel.tsx", "utf8"),
    readFile("src/components/storefront/storefront.module.css", "utf8"),
  ])

  assert.match(header, /optimized-storefront-header/)
  assert.match(header, /common.openMenu/)
  assert.match(hero, /Shop this look/)
  assert.match(gallery, /meson-gallery-thumbnails/)
  assert.match(purchase, /meson-purchase-stack/)
  assert.match(styles, /\.mesonProductLayout/)
})

test("optimized storefront restores cart presentation without changing checkout", async () => {
  const [cartPage, cookieConsent] = await Promise.all([
    readFile("src/app/cart/page.tsx", "utf8"),
    readFile("src/components/CookieConsent.tsx", "utf8"),
  ])

  assert.match(cartPage, /optimized-cart-layout/)
  assert.match(cartPage, /meson-cart-shell/)
  assert.match(cartPage, /useCart/)
  assert.doesNotMatch(cartPage, /api\/webhooks|stripe\.checkout/i)
  assert.match(cookieConsent, /grid-cols-2/)
})
