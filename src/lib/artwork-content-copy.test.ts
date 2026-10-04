import assert from "node:assert/strict"
import test from "node:test"
import { buildArtworkContentCopy } from "./artwork-content-copy"

const templateCopy = {
  description: "Dawn Peak (FJ-001) is a made-to-order painting by Sofie Lindberg. Size and price follow YiiArt’s rolled-canvas matrix. The piece you receive is hand-painted, not a print.",
  shortDescription: "Dawn Peak is a hand-painted canvas by Sofie Lindberg, made to order in custom sizes. The listing shows the finished composition; brushwork will vary.",
  artworkStory: "This painting is part of Sofie Lindberg’s YiiArt collection. The images show the approved composition, palette, and texture. Each canvas is painted by hand to order, so edges, pigment density, and small marks differ while keeping the same visual direction.",
}

test("replaces catalog boilerplate with confirmed product attributes", () => {
  const copy = buildArtworkContentCopy({
    title: "Dawn Peak",
    artistName: "Sofie Lindberg",
    category: "Landscape",
    medium: "Acrylic on Canvas",
    colorFamilies: ["Neutral", "Earth tone"],
    roomTypes: ["Living room", "Bedroom", "Office"],
    sizeCount: 8,
    ...templateCopy,
  })

  assert.equal(copy.about, "Dawn Peak is a made-to-order landscape painting in acrylic on canvas by Sofie Lindberg. Its catalog palette is neutral and earth tones. YiiArt recommends it for living rooms, bedrooms, and offices. Choose from 8 listed sizes, checking your wall and furniture measurements before ordering.")
  assert.match(copy.shortDescription, /Landscape painting in acrylic on canvas/)
  assert.match(copy.shortDescription, /neutral and earth tones/)
  assert.match(copy.metaDescription, /8 sizes/)
  assert.equal(copy.artworkStory, "")
})

test("uses grammatical artwork nouns for every supported style category", () => {
  const categories = [
    ["Abstract", "abstract painting"],
    ["Landscape", "landscape painting"],
    ["Portrait", "portrait painting"],
    ["Figurative", "figurative painting"],
    ["Texture", "textured painting"],
    ["Wabi-sabi", "wabi-sabi painting"],
    ["Minimalist", "minimalist painting"],
  ]

  for (const [category, artForm] of categories) {
    const copy = buildArtworkContentCopy({
      title: "Test Artwork",
      artistName: "Test Artist",
      category,
      medium: "Acrylic on canvas",
      colorFamilies: ["Blue"],
      roomTypes: ["Living room"],
      sizeCount: 4,
      ...templateCopy,
    })

    assert.ok(copy.about.includes(`made-to-order ${artForm}`), category)
    assert.ok(copy.shortDescription.includes(`${artForm[0].toUpperCase()}${artForm.slice(1)} in acrylic`), category)
    assert.ok(copy.metaDescription.includes(`hand-painted ${artForm} in acrylic`), category)
  }
})

test("preserves distinct editorial copy without rewriting it", () => {
  const authored = {
    description: "A quiet shoreline built from broken blue strokes and a narrow band of pale sky.",
    shortDescription: "Blue brushwork gives this landscape a measured, open rhythm.",
    artworkStory: "The artist developed the study after a series of walks along the northern coast.",
  }

  const copy = buildArtworkContentCopy({
    title: "Quiet Shore",
    artistName: "Sofie Lindberg",
    category: "Landscape",
    medium: "Acrylic on Canvas",
    ...authored,
  })

  assert.deepEqual(copy, {
    about: authored.description,
    shortDescription: authored.shortDescription,
    artworkStory: authored.artworkStory,
    metaDescription: authored.description,
  })
})

test("keeps existing template copy when key attributes are unavailable", () => {
  const copy = buildArtworkContentCopy({
    title: "Untitled",
    artistName: "YiiArt",
    ...templateCopy,
  })

  assert.equal(copy.about, templateCopy.description)
  assert.equal(copy.shortDescription, templateCopy.shortDescription)
  assert.equal(copy.artworkStory, templateCopy.artworkStory)
})
