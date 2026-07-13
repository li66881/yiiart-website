import { describe, expect, it } from "vitest"
import { isValidCartItem } from "./CartContext"

describe("isValidCartItem", () => {
  const baseItem = {
    id: "artwork-1",
    title: "Quiet Meridian",
    artist: "Huang Liang",
    price: 10900,
    image: "/artwork.png",
    quantity: 1,
  }

  it("accepts an optional string presentation option", () => {
    expect(isValidCartItem({ ...baseItem, presentationOption: "Stretched" })).toBe(true)
  })

  it("rejects a non-string presentation option", () => {
    expect(isValidCartItem({ ...baseItem, presentationOption: { label: "Stretched" } })).toBe(false)
  })
})
