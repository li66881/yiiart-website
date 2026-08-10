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
    featured: true,
    _createdAt: "2026-08-10T00:00:00.000Z",
    standardSizes: [{ _key: "80x100", label: "80 x 100 cm", priceCny: 2600 }],
  })

  assert.equal(item.collectionType, "new_collection")
  assert.equal(item.productionModel, "hand_painted_to_order")
  assert.equal(item.price, 2600)
  assert.equal(item.featured, true)
  assert.equal(item.createdAt, "2026-08-10T00:00:00.000Z")
})

test("matches All Art, New Collection, and Artist Collection tabs", () => {
  const newItem = { collectionType: "new_collection" } as never
  const artistItem = { collectionType: "artist_collection" } as never

  assert.equal(artworkMatchesCollection(newItem, "all"), true)
  assert.equal(artworkMatchesCollection(newItem, "new_collection"), true)
  assert.equal(artworkMatchesCollection(newItem, "artist_collection"), false)
  assert.equal(artworkMatchesCollection(artistItem, "artist_collection"), true)
})

test("maps URL discovery state to real filters and sort modes", async () => {
  const discovery = await import("./artwork-discovery")
  const buildInitialState = (discovery as any).buildArtworkDiscoveryInitialState

  assert.equal(typeof buildInitialState, "function")
  assert.deepEqual(buildInitialState({
    sort: "newest",
    room: "Dining Room",
    color: ["Black", "White"],
  }), {
    sortMode: "newest",
    filters: {
      styles: [],
      rooms: ["Dining Room"],
      colors: ["Black", "White"],
      sizes: [],
      orientations: [],
    },
  })
  assert.equal(buildInitialState({ sort: "unknown" }).sortMode, "featured")
})

test("sorts featured art by curation and newest art by creation date", async () => {
  const discovery = await import("./artwork-discovery")
  const sortItems = (discovery as any).sortArtworkDiscoveryItems
  const items = [
    { id: "old-featured", featured: true, createdAt: "2026-01-01T00:00:00.000Z", price: 300, size: "Medium" },
    { id: "new-standard", featured: false, createdAt: "2026-08-01T00:00:00.000Z", price: 200, size: "Large" },
    { id: "new-featured", featured: true, createdAt: "2026-07-01T00:00:00.000Z", price: 400, size: "Small" },
  ] as never[]

  assert.equal(typeof sortItems, "function")
  assert.deepEqual(sortItems(items, "featured").map((item: any) => item.id), ["new-featured", "old-featured", "new-standard"])
  assert.deepEqual(sortItems(items, "newest").map((item: any) => item.id), ["new-standard", "new-featured", "old-featured"])
})
