import { describe, expect, it } from "vitest"
import { normalizeCheckoutItems, resolveCheckoutPresentation } from "./checkout"

describe("normalizeCheckoutItems", () => {
  it("preserves a trimmed presentation option", () => {
    expect(normalizeCheckoutItems([
      { id: "artwork-1", quantity: 1, presentationOption: " Natural Oak Float Frame " },
    ])).toEqual([
      { id: "artwork-1", quantity: 1, presentationOption: "Natural Oak Float Frame" },
    ])
  })
})

describe("resolveCheckoutPresentation", () => {
  it("returns configured same-price choices", () => {
    expect(resolveCheckoutPresentation("Stretched", ["Rolled Canvas", "Stretched"]))
      .toBe("Stretched")
  })

  it("rejects choices not configured in Sanity", () => {
    expect(() => resolveCheckoutPresentation("Gold Frame", ["Rolled Canvas", "Stretched"]))
      .toThrow("Selected presentation option is not available.")
  })

  it("requires a choice when Sanity configures presentation options", () => {
    expect(() => resolveCheckoutPresentation(undefined, ["Rolled Canvas", "Stretched"]))
      .toThrow("Select a presentation option before checkout.")
  })
})
