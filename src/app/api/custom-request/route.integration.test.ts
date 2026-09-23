// @vitest-environment node
import { afterAll, beforeEach, expect, test, vi } from "vitest"
import { NextRequest } from "next/server"

const stored = vi.hoisted(() => {
  let document: Record<string, unknown> | null = null
  return {
    getDocument: vi.fn(async (id: string) => document?._id === id ? document : null),
    createIfNotExists: vi.fn(async (value: Record<string, unknown>) => {
      if (!document) document = value
      return document
    }),
    clear: () => { document = null },
  }
})

vi.mock("@sanity/client", () => ({ createClient: () => stored }))
vi.mock("@/lib/r2", () => ({ isR2Configured: () => false, uploadR2Object: vi.fn() }))

import { POST } from "./route"

const originalToken = process.env.SANITY_WRITE_TOKEN
const originalResend = process.env.RESEND_API_KEY
const originalSendGrid = process.env.SENDGRID_API_KEY

beforeEach(() => {
  stored.clear()
  stored.getDocument.mockClear()
  stored.createIfNotExists.mockClear()
  process.env.SANITY_WRITE_TOKEN = "test-token"
  delete process.env.RESEND_API_KEY
  delete process.env.SENDGRID_API_KEY
})

afterAll(() => {
  if (originalToken === undefined) delete process.env.SANITY_WRITE_TOKEN
  else process.env.SANITY_WRITE_TOKEN = originalToken
  if (originalResend === undefined) delete process.env.RESEND_API_KEY
  else process.env.RESEND_API_KEY = originalResend
  if (originalSendGrid === undefined) delete process.env.SENDGRID_API_KEY
  else process.env.SENDGRID_API_KEY = originalSendGrid
})

function request(form: FormData) {
  return new NextRequest("http://localhost/api/custom-request", { method: "POST", body: form })
}

function projectForm() {
  const form = new FormData()
  form.set("intent", "project")
  form.set("requestId", "785ee1f5-9c15-4d37-bf17-461376014c55")
  form.set("name", "Test Designer")
  form.set("email", "designer@example.com")
  form.set("clientRole", "Interior designer")
  form.set("company", "Test Studio")
  form.set("destinationCountry", "United States")
  form.set("artworkQuantity", "3")
  form.set("projectTiming", "Autumn 2027")
  form.set("message", "Three works for a residential living room.")
  form.set("artworkSlug", "white-peony-relief")
  return form
}

test("a project enquiry requires role, destination, and a brief before any write", async () => {
  const form = projectForm()
  form.delete("destinationCountry")
  const response = await POST(request(form))
  expect(response.status).toBe(400)
  expect(stored.createIfNotExists).not.toHaveBeenCalled()
})

test("a project enquiry stores qualification details and a retry keeps one record", async () => {
  const form = projectForm()
  const first = await POST(request(form))
  expect(first.status).toBe(200)
  expect(stored.createIfNotExists).toHaveBeenCalledWith(expect.objectContaining({
    _id: "customRequest-785ee1f5-9c15-4d37-bf17-461376014c55",
    intent: "project",
    clientRole: "Interior designer",
    company: "Test Studio",
    destinationCountry: "United States",
    artworkQuantity: "3",
    projectTiming: "Autumn 2027",
    artworkSlug: "white-peony-relief",
  }))

  const retry = await POST(request(form))
  expect(retry.status).toBe(200)
  expect(stored.createIfNotExists).toHaveBeenCalledTimes(1)
})
