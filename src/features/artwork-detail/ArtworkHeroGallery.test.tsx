import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArtworkHeroGallery from "./ArtworkHeroGallery"

const items = [
  { url: "/room.webp", role: "room" as const, alt: "Room visualization", isVisualization: true },
  { url: "/artwork.webp", role: "artwork" as const, alt: "Full artwork", isVisualization: false },
]

describe("ArtworkHeroGallery", () => {
  it("uses a vertical desktop rail and horizontal mobile strip", () => {
    const { container } = render(<ArtworkHeroGallery items={items} />)
    expect(container.querySelector('[data-gallery-layout="natural-studio"]'))
      .toHaveClass("lg:grid-cols-[6.5rem_minmax(0,1fr)]")
    expect(screen.getByRole("group", { name: "Artwork views" }))
      .toHaveClass("lg:flex-col", "overflow-x-auto", "lg:overflow-visible")
  })

  it("starts with the room visualization even when it is not the first asset", () => {
    render(<ArtworkHeroGallery items={[items[1], items[0]]} />)
    expect(screen.getByRole("img", { name: "Room visualization" })).toBeInTheDocument()
  })

  it("switches the main image and exposes selected state", () => {
    render(<ArtworkHeroGallery items={items} />)
    fireEvent.click(screen.getByRole("button", { name: "Show Full artwork" }))
    expect(screen.getByRole("img", { name: "Full artwork" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Show Full artwork" })).toHaveAttribute("aria-pressed", "true")
  })

  it("supports arrow-key navigation between thumbnails", () => {
    render(<ArtworkHeroGallery items={items} />)
    const roomButton = screen.getByRole("button", { name: "Show Room visualization" })
    roomButton.focus()
    fireEvent.keyDown(roomButton, { key: "ArrowRight" })
    expect(screen.getByRole("button", { name: "Show Full artwork" })).toHaveFocus()
    expect(screen.getByRole("button", { name: "Show Full artwork" })).toHaveAttribute("aria-pressed", "true")
  })

  it("hides thumbnail controls for a single image", () => {
    render(<ArtworkHeroGallery items={[items[0]]} />)
    expect(screen.queryByRole("button", { name: "Show Room visualization" })).not.toBeInTheDocument()
  })

  it("renders nothing when no images exist", () => {
    const { container } = render(<ArtworkHeroGallery items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
