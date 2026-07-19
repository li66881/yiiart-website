import assert from "node:assert/strict"
import test from "node:test"
import {
  artworkMatchesCollection,
  buildArtworkDiscoveryItem,
} from "./artwork-discovery"

test("defaults legacy discovery records to Artist Collection", () => {
  const item = buildArtworkDiscoveryItem({
    _id: "legacy-1",
    title: { en: "Legacy Work" },
    price: 7200,
  })

  assert.equal(item.collectionType, "artist_collection")
  assert.equal(item.productionModel, "original")
})

test("keeps approved made-to-order collection metadata", () => {
  const item = buildArtworkDiscoveryItem({
    _id: "catalog-1",
    title: { en: "Soft Horizon" },
    collectionType: "new_collection",
    productionModel: "hand_painted_to_order",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
  })

  assert.equal(item.collectionType, "new_collection")
  assert.equal(item.productionModel, "hand_painted_to_order")
  assert.equal(item.price, 2600)
})

test("matches All Art, New Collection, and Artist Collection tabs", () => {
  const newItem = { collectionType: "new_collection" } as never
  const artistItem = { collectionType: "artist_collection" } as never

  assert.equal(artworkMatchesCollection(newItem, "all"), true)
  assert.equal(artworkMatchesCollection(newItem, "new_collection"), true)
  assert.equal(artworkMatchesCollection(newItem, "artist_collection"), false)
  assert.equal(artworkMatchesCollection(artistItem, "artist_collection"), true)
})
