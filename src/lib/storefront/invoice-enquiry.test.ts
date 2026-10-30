import assert from "node:assert/strict"
import test from "node:test"
import { buildInvoiceEnquiryUrl } from "./invoice-enquiry"

const selection = {
  title: "Blue & Gold",
  size: "80 x 100 cm",
  finish: "Black float frame",
  quantity: 2,
  artworkUrl: "https://www.yiiart.com/artwork/blue?size=80x100&finish=black-frame",
}

test("invoice enquiry preserves recipient and safely encodes the chosen configuration", () => {
  const url = new URL(buildInvoiceEnquiryUrl("https://wa.me/123456789?text=Old&lang=en", selection))
  assert.equal(url.pathname, "/123456789")
  assert.equal(url.searchParams.get("lang"), "en")
  assert.equal(url.searchParams.getAll("text").length, 1)
  const message = url.searchParams.get("text")!
  assert.ok(message.includes("Artwork: Blue & Gold\nSize: 80 x 100 cm"))
  assert.ok(message.includes("Presentation: Black float frame\nQuantity: 2"))
  assert.ok(message.includes(selection.artworkUrl))
  assert.ok(message.includes("confirm availability, shipping suitability"))
})

test("invoice enquiry leaves non-WhatsApp destinations unchanged", () => {
  for (const url of ["/invoice", "https://example.com/invoice", "http://wa.me/123456789", "invalid"]) {
    assert.equal(buildInvoiceEnquiryUrl(url, selection), url)
  }
})
