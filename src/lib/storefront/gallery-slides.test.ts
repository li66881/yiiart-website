import assert from "node:assert/strict"
import test from "node:test"
import { buildGallerySlides } from "./gallery-slides"

test("synthesizes white-bg, room, and detail slides from a single photo", () => {
  const slides = buildGallerySlides(
    [
      {
        id: "main",
        type: "image",
        role: "front",
        url: "https://cdn.example/art.jpg",
        alt: "Quiet Field",
      },
    ],
    "Quiet Field",
  )

  assert.ok(slides.length >= 3)
  assert.equal(slides[0].viewMode, "white_bg")
  assert.ok(slides.some((slide) => slide.viewMode === "room" && slide.scene === "living"))
  assert.ok(slides.some((slide) => slide.viewMode === "detail"))
  assert.ok(slides.some((slide) => slide.role === "bedroom"))
})

test("keeps real room photos ahead of synthetic bedroom alternate", () => {
  const slides = buildGallerySlides(
    [
      {
        id: "front",
        type: "image",
        role: "front",
        url: "https://cdn.example/front.jpg",
        alt: "Front",
      },
      {
        id: "room",
        type: "image",
        role: "living_room",
        url: "https://cdn.example/room.jpg",
        alt: "Room",
      },
    ],
    "Artwork",
  )

  assert.equal(slides[0].viewMode, "white_bg")
  assert.ok(slides.some((slide) => slide.url === "https://cdn.example/room.jpg" && slide.viewMode === "photo"))
})
