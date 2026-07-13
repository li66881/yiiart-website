import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ChatWidget from "./ChatWidget"

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => ({
      "chat.openSupport": "Open support",
    }[key] || key),
  }),
}))

vi.mock("@/lib/marketing-events", () => ({
  trackMarketingEvent: vi.fn(),
}))

describe("ChatWidget", () => {
  it("sits above the mobile purchase bar while retaining the desktop position", () => {
    render(<ChatWidget />)

    expect(screen.getByRole("button", { name: "Open support" }))
      .toHaveClass("bottom-24", "lg:bottom-6")
  })
})
