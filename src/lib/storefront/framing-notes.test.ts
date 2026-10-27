import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import {
  normalizePublicArtworkFramingNotes,
  normalizePublicFramingNotes,
  rolledCanvasDeliveryNote,
} from "./framing-notes"

test("replaces the legacy rolled-direct-checkout note with confirmed delivery terms", () => {
  const actual = normalizePublicFramingNotes(
    "Ships rolled for direct checkout. Stretching and framing can be requested through custom service.",
    "Ships rolled",
  )

  assert.equal(actual, rolledCanvasDeliveryNote)
  assert.doesNotMatch(actual, /direct checkout/i)
})

test("uses destination confirmation when the shipping profile is not rolled", () => {
  assert.equal(
    normalizePublicFramingNotes("Ships rolled for direct checkout.", "Ships stretched"),
    "Delivery format is confirmed for the destination and selected size.",
  )
})

test("preserves current specific notes and normalizes artwork payloads immutably", () => {
  const source = {
    slug: "sample-artwork",
    framingNotes: "Ask us about a custom float frame.",
    shippingProfile: "Ships rolled",
  }
  const normalized = normalizePublicArtworkFramingNotes(source)

  assert.equal(normalized.framingNotes, source.framingNotes)
  assert.equal(source.framingNotes, "Ask us about a custom float frame.")
  assert.notEqual(normalized, source)
})

test("normalizes Sanity artwork notes before public pages serialize full product documents", async () => {
  const [homePage, artworksPage, collectionCatalog, artworkPage, finishSelector] = await Promise.all([
    readFile("src/app/page.tsx", "utf8"),
    readFile("src/app/artworks/page.tsx", "utf8"),
    readFile("src/lib/storefront/collection-catalog.ts", "utf8"),
    readFile("src/app/artwork/[slug]/page.tsx", "utf8"),
    readFile("src/components/storefront/ProductFinishSelector.tsx", "utf8"),
  ])

  assert.match(homePage, /artworks\.map\(normalizePublicArtworkFramingNotes\)/)
  assert.match(artworksPage, /artworks\.map\(normalizePublicArtworkFramingNotes\)/)
  assert.match(collectionCatalog, /\.map\(normalizePublicArtworkFramingNotes\)/)
  assert.doesNotMatch(artworkPage, /Ships rolled for direct checkout|Rolled canvas is currently available for direct checkout/i)
  assert.doesNotMatch(finishSelector, /Direct checkout is currently limited to rolled canvas/i)
})
