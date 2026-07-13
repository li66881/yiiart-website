import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("artwork detail mobile footer safety", () => {
  it("reserves space below the footer for the fixed purchase bar", () => {
    const pageSource = readFileSync("src/app/artwork/[slug]/page.tsx", "utf8")

    expect(pageSource).toContain(
      '<div className="h-24 bg-stone-950 lg:hidden" aria-hidden="true" />',
    )
  })
})
