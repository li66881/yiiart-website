import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArtworkMaterialStory from "./ArtworkMaterialStory"

describe("ArtworkMaterialStory", () => {
  it("renders two detail images", () => {
    render(<ArtworkMaterialStory
      heading="Made by hand, understood in the room."
      items={[
        { url: "/texture.webp", role: "texture", alt: "Texture", isVisualization: false },
        { url: "/edge.webp", role: "edge", alt: "Edge", isVisualization: false },
      ]}
    />)
    expect(screen.getByText("Made by hand, understood in the room.")).toBeInTheDocument()
    expect(screen.getAllByRole("img")).toHaveLength(2)
  })

  it("collapses when fewer than two detail images exist", () => {
    const { container } = render(<ArtworkMaterialStory heading="Material" items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
