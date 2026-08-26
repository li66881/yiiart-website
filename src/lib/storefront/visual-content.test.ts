import assert from "node:assert/strict"
import test from "node:test"
import { buildEditorialHomeEdit, editorialHomeSequence, handPaintedDisclosure, resolveVisualImage } from "./visual-content"

test("uses the first approved image as the visual lead", () => {
  assert.equal(resolveVisualImage(["hero.jpg", "detail.jpg"]), "hero.jpg")
  assert.equal(resolveVisualImage([], "fallback.jpg"), "fallback.jpg")
  assert.equal(resolveVisualImage([]), null)
})

test("only made-to-order works receive the variation disclosure", () => {
  assert.match(handPaintedDisclosure("hand_painted_to_order") || "", /hand-painted to order/i)
  assert.equal(handPaintedDisclosure("original"), null)
})

test("keeps artist collection works separate in the editorial home edit", () => {
  const edit = buildEditorialHomeEdit([
    { id: "new-1", collectionType: "new_collection" },
    { id: "artist-1", collectionType: "artist_collection" },
    { id: "new-2", collectionType: "new_collection" },
  ])

  assert.deepEqual(edit.featured.map((item) => item.id), ["new-1", "new-2"])
  assert.deepEqual(edit.artistCollection.map((item) => item.id), ["artist-1"])
})

test("builds featured and new-arrival edits from explicit catalog data", () => {
  const edit = buildEditorialHomeEdit([
    { id: "older-featured", collectionType: "new_collection", featured: true, _createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "newest", collectionType: "new_collection", featured: false, _createdAt: "2026-08-01T00:00:00.000Z" },
    { id: "newer-featured", collectionType: "new_collection", featured: true, _createdAt: "2026-07-01T00:00:00.000Z" },
    { id: "artist-1", collectionType: "artist_collection", featured: true, _createdAt: "2026-08-10T00:00:00.000Z" },
  ])

  assert.deepEqual(edit.featured.map((item) => item.id), ["newer-featured", "older-featured", "newest"])
  assert.deepEqual(edit.newArrivals.map((item) => item.id), ["newer-featured", "older-featured", "newest"])
  assert.deepEqual(edit.artistCollection.map((item) => item.id), ["artist-1"])
})

test("does not promote hang videos ahead of still images on the homepage edit", () => {
  const edit = buildEditorialHomeEdit([
    { id: "still", collectionType: "new_collection", featured: true, _createdAt: "2026-08-12T00:00:00.000Z" },
    {
      id: "video",
      collectionType: "new_collection",
      featured: false,
      _createdAt: "2026-08-01T00:00:00.000Z",
      productMedia: [{
        mediaType: "video",
        role: "process",
        url: "https://assets.yiiart.com/hang.mp4",
        approvedForStorefront: true,
      }],
    },
  ])

  assert.deepEqual(edit.newArrivals.map((item) => item.id), ["still", "video"])
  assert.deepEqual(edit.featured.map((item) => item.id), ["still", "video"])
})

test("inline videos play only when visible and motion is allowed", async () => {
  const { shouldPlayInlineVideo } = await import("./visual-content")

  assert.equal(shouldPlayInlineVideo({ isIntersecting: true, intersectionRatio: 0.5, prefersReducedMotion: false }), true)
  assert.equal(shouldPlayInlineVideo({ isIntersecting: true, intersectionRatio: 0.1, prefersReducedMotion: false }), false)
  assert.equal(shouldPlayInlineVideo({ isIntersecting: false, intersectionRatio: 1, prefersReducedMotion: false }), false)
  assert.equal(shouldPlayInlineVideo({ isIntersecting: true, intersectionRatio: 0.8, prefersReducedMotion: true }), false)
})

test("carousel autoplay stops for user pause, hover, or reduced motion", async () => {
  const visualContent = await import("./visual-content")
  const shouldAutoplay = (visualContent as any).shouldAutoplayCarousel

  assert.equal(typeof shouldAutoplay, "function")
  assert.equal(shouldAutoplay({ slideCount: 3, userPaused: false, hoverPaused: false, prefersReducedMotion: false }), true)
  assert.equal(shouldAutoplay({ slideCount: 3, userPaused: true, hoverPaused: false, prefersReducedMotion: false }), false)
  assert.equal(shouldAutoplay({ slideCount: 3, userPaused: false, hoverPaused: true, prefersReducedMotion: false }), false)
  assert.equal(shouldAutoplay({ slideCount: 3, userPaused: false, hoverPaused: false, prefersReducedMotion: true }), false)
  assert.equal(shouldAutoplay({ slideCount: 1, userPaused: false, hoverPaused: false, prefersReducedMotion: false }), false)
})

test("uses a distinct editorial sequence for the home page", () => {
  assert.deepEqual(editorialHomeSequence(), ["discover", "place", "process", "customize", "trust"])
})
