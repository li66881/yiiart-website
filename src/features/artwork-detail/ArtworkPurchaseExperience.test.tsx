import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArtworkPurchaseExperience from "./ArtworkPurchaseExperience"

vi.mock("@/components/AddToCartButton", () => ({
  default: ({ item }: { item: { presentationOption?: string } }) => (
    <button type="button" aria-label="Cart action" data-testid="cart-presentation">
      {item.presentationOption || "none"}
    </button>
  ),
}))
vi.mock("@/components/PriceText", () => ({
  PriceText: () => <span>$1,520 USD</span>,
  PriceDisclosure: () => <span>International price disclosure</span>,
}))
vi.mock("@/components/ReviewStars", () => ({ default: () => <span>Stars</span> }))
vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => ({
      "artwork.addToCart": "Add to cart",
      "product.askWhatsApp": "Ask on WhatsApp before purchase",
      "product.selectedSize": "Selected size",
      "product.chooseFinish": "Choose finish",
      "product.oneOfAKind": "One-of-a-kind original",
      "product.certificateIncluded": "Certificate of authenticity",
      "product.worldwideDelivery": "Free worldwide delivery",
      "product.returnWindow": "30-day return window",
    }[key] || key),
  }),
}))

const baseProps = {
  eyebrow: "Textured Art / Mixed Media on Canvas",
  title: "Quiet Meridian",
  artistName: "Huang Liang",
  description: "Built in thin layers of plaster, ash gray, and muted gold.",
  dimensions: "90 x 140 cm / 35.4 x 55.1 in",
  priceCny: 10900,
  reviewCount: 18,
  reviewOverall: 5,
  presentationOptions: [{ label: "Rolled Canvas" }],
  presentationFallbackText: "Confirm presentation before dispatch",
  baseCartItem: {
    id: "artwork-1",
    title: "Quiet Meridian",
    artist: "Huang Liang",
    price: 10900,
    image: "/artwork.png",
  },
  directCheckoutAvailable: true,
  invoiceUrl: "https://example.com/invoice",
  whatsappUrl: "https://example.com/whatsapp",
  displayPriceOverride: undefined,
  previewMode: false,
  productTags: [
    { label: "Original Artwork" },
    { label: "Hand-Painted Texture" },
    { label: "Certificate Included" },
  ],
  sizeGuideHref: "/size-guide",
  studioPhotoMode: "included" as const,
}

describe("ArtworkPurchaseExperience", () => {
  it("renders natural studio tags, size guide, and photo approval copy", () => {
    render(<ArtworkPurchaseExperience {...baseProps} />)
    expect(screen.getByText("Original Artwork")).toBeInTheDocument()
    expect(screen.getByText("Hand-Painted Texture")).toBeInTheDocument()
    expect(screen.getByText("Certificate Included")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Size & room guide" }))
      .toHaveAttribute("href", "/size-guide")
    expect(screen.getByText("We send studio photos before shipping.")).toBeInTheDocument()
  })

  it("renders presentation options as rows with supporting copy", () => {
    render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[
      { label: "Rolled Canvas", image: "/rolled.png", description: "Ships rolled in a protective tube" },
      { label: "Stretched", image: "/stretched.png", description: "Ready to hang" },
    ]} />)
    expect(screen.getByRole("button", { name: "Rolled Canvas" }))
      .toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Ships rolled in a protective tube")).toBeInTheDocument()
    expect(screen.getByText("Ready to hang")).toBeInTheDocument()
  })

  it("uses request wording when studio photos are not included", () => {
    render(<ArtworkPurchaseExperience {...baseProps} studioPhotoMode="request" />)
    expect(screen.getByText("Request studio photos before shipping.")).toBeInTheDocument()
  })

  it("selects a presentation option and passes it to both purchase actions", () => {
    render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[
      { label: "Rolled Canvas" },
      { label: "Stretched" },
    ]} />)
    fireEvent.click(screen.getByRole("button", { name: "Stretched" }))
    expect(screen.getByRole("button", { name: "Stretched" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByTestId("cart-presentation").map((node) => node.textContent))
      .toEqual(["Stretched", "Stretched"])
  })

  it("hides preview reviews when the real review count is zero", () => {
    render(<ArtworkPurchaseExperience {...baseProps} reviewCount={0} reviewOverall={0} />)
    expect(screen.queryByText(/verified collector reviews/i)).not.toBeInTheDocument()
  })

  it("shows the framing fallback when no presentation choices are configured", () => {
    render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[]} />)
    expect(screen.getByText("Confirm presentation before dispatch")).toBeInTheDocument()
  })

  it("renders configured presentation thumbnails", () => {
    render(<ArtworkPurchaseExperience {...baseProps} presentationOptions={[
      { label: "Rolled Canvas", image: "/rolled.png" },
      { label: "Stretched", image: "/stretched.png" },
    ]} />)
    expect(screen.getByRole("img", { name: "Rolled Canvas" })).toHaveAttribute("src", "/rolled.png")
    expect(screen.getByRole("img", { name: "Stretched" })).toHaveAttribute("src", "/stretched.png")
  })

  it("uses the invoice path when direct checkout is unavailable", () => {
    render(<ArtworkPurchaseExperience {...baseProps} directCheckoutAvailable={false} />)
    expect(screen.getAllByRole("link", { name: "Request an invoice" })[0])
      .toHaveAttribute("href", "https://example.com/invoice")
    expect(screen.queryByTestId("cart-presentation")).not.toBeInTheDocument()
  })

  it("uses local feedback and never calls the real cart in preview mode", () => {
    render(<ArtworkPurchaseExperience
      {...baseProps}
      previewMode
      directCheckoutAvailable={false}
      displayPriceOverride="$1,520 USD"
    />)
    fireEvent.click(screen.getAllByRole("button", { name: "Add to cart" })[0])
    expect(screen.getAllByRole("button", { name: "Added to prototype cart" })).not.toHaveLength(0)
    expect(screen.queryByTestId("cart-presentation")).not.toBeInTheDocument()
  })
})
