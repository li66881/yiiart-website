import React from "react"
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import Page from "./page"

const clearCart = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams("session_id=TEST-ONLY") }))
vi.mock("@/components/Header", () => ({ default: () => null }))
vi.mock("@/components/Footer", () => ({ default: () => null }))
vi.mock("@/context/CartContext", () => ({ useCart: () => ({ clearCart, items: [], subtotal: 0 }) }))
vi.mock("@/lib/marketing-events", () => ({ trackMarketingEvent: vi.fn() }))
vi.mock("@/components/GoogleCustomerReviews", () => ({ default: ({ invitation }: { invitation: unknown }) => <span data-testid="review">{invitation ? "eligible" : "none"}</span> }))
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

it("waits for the payment webhook without changing payment state", async () => {
  vi.useFakeTimers()
  const order = { orderNumber: "TEST-ONLY", status: "pending_payment", totalAmount: 10, currency: "USD" }
  const request = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ order }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ order: { ...order, status: "paid" }, googleReviewOptIn: { order_id: "TEST-ONLY" } }) })
  vi.stubGlobal("fetch", request)
  await act(async () => { render(<Page />) })
  expect(screen.getByTestId("review").textContent).toBe("none")
  await act(async () => { await vi.advanceTimersByTimeAsync(1500) })
  expect(screen.getByTestId("review").textContent).toBe("eligible")
  await act(async () => { await vi.advanceTimersByTimeAsync(6000) })
  expect(request).toHaveBeenCalledTimes(2)
  expect(request).toHaveBeenLastCalledWith("/api/orders?session_id=TEST-ONLY", { cache: "no-store" })
})
