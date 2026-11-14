/** @vitest-environment-options {"url":"https://www.yiiart.com/checkout/success"} */
import React from "react"
import { cleanup, render } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import GoogleCustomerReviews from "./GoogleCustomerReviews"

const scripts = vi.hoisted(() => ({ ready: undefined as undefined | (() => void) }))
vi.mock("next/script", () => ({ default: (props: { onReady: () => void }) => {
  scripts.ready = props.onReady
  return null
} }))
const invitation = { merchant_id: 5900598967, order_id: "TEST-ONLY", email: "buyer@example.com", delivery_country: "US", estimated_delivery_date: "2026-11-27" }
afterEach(() => {
  cleanup()
  delete window.gapi
  delete window.yiiartReviewInvitations
  scripts.ready = undefined
})

it("does not load Google for ineligible orders", () => {
  render(<GoogleCustomerReviews invitation={null} />)
  expect(scripts.ready).toBeUndefined()
})

it("renders the exact approved payload once despite repeated script readiness", () => {
  const survey = vi.fn()
  window.gapi = { load: (_name, callback) => callback(), surveyoptin: { render: survey } }
  render(<GoogleCustomerReviews invitation={invitation} />)
  expect(scripts.ready).toBeDefined()
  scripts.ready?.()
  scripts.ready?.()
  expect(survey).toHaveBeenCalledExactlyOnceWith(invitation)
})

it("keeps confirmation usable when Google's library fails", () => {
  window.gapi = { load: () => { throw new Error("Offline") }, surveyoptin: { render: vi.fn() } }
  render(<GoogleCustomerReviews invitation={invitation} />)
  expect(() => scripts.ready?.()).not.toThrow()
  expect(window.yiiartReviewInvitations?.has(invitation.order_id)).toBe(false)
})
