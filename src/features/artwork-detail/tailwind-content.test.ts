import { createRequire } from "node:module"
import { describe, expect, it } from "vitest"

const require = createRequire(import.meta.url)
const tailwindConfig = require("../../../tailwind.config.js") as { content?: string[] }

describe("Tailwind artwork detail sources", () => {
  it("scans feature components for generated utility classes", () => {
    expect(tailwindConfig.content).toContain("./src/features/**/*.{js,ts,jsx,tsx,mdx}")
  })
})
