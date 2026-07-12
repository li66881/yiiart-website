import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArtworkSimilarStrip from "./ArtworkSimilarStrip"

vi.mock("@/components/PriceText", () => ({
  PriceText: () => <span>$420 USD</span>,
}))

vi.mock("@/lib/artwork-images", () => ({
  getArtworkImageUrl: () => "/stone-current.jpg",
}))

const artwork = {
  _id: "related-1",
  title: { en: "Stone Current" },
  slug: { current: "stone-current" },
  price: 3000,
  dimensions: "80 x 120 cm",
  medium: "Acrylic on canvas",
  category: "Abstract",
  cloudflareImages: [{ url: "/stone-current.jpg" }],
}

describe("ArtworkSimilarStrip", () => {
  it("renders related artwork as the visually similar strip", () => {
    render(<ArtworkSimilarStrip artworks={[artwork]} />)
    expect(screen.getByRole("heading", { name: "Visually Similar Artworks" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Stone Current/ }))
      .toHaveAttribute("href", "/artwork/stone-current")
  })

  it("renders nothing without related artwork", () => {
    const { container } = render(<ArtworkSimilarStrip artworks={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
