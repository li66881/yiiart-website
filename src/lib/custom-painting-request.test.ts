import assert from "node:assert/strict"
import test from "node:test"
import {
  CUSTOM_PAINTING_MAX_FILE_SIZE,
  buildCustomPaintingDocument,
  validateCustomPaintingRequest,
  validateUploadFiles,
  validateUploadedAssets,
} from "./custom-painting-request"

const validRequest = {
  name: "Ada Collector",
  email: " ADA@example.com ",
  artworkSize: "120 x 180 cm",
  preferredColors: "Warm neutral",
  roomType: "Living room",
  budget: "$1,000 - $2,000",
  message: "A quiet textured painting for the wall above the sofa.",
  company: "",
  assets: [],
}

test("normalizes a valid custom painting request", () => {
  const result = validateCustomPaintingRequest(validRequest, {
    assetBaseUrl: "https://assets.yiiart.com",
    r2Prefix: "uploads",
  })

  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.value.email, "ada@example.com")
    assert.equal(result.value.name, "Ada Collector")
  }
})

test("rejects invalid email and honeypot submissions", () => {
  const invalidEmail = validateCustomPaintingRequest({ ...validRequest, email: "not-an-email" })
  const botSubmission = validateCustomPaintingRequest({ ...validRequest, company: "spam" })

  assert.deepEqual(invalidEmail, { ok: false, error: "Please enter a valid email address." })
  assert.deepEqual(botSubmission, { ok: false, error: "Request could not be submitted." })
})

test("rejects too many, oversized, and unsupported upload files", () => {
  const tooMany = Array.from({ length: 6 }, (_, index) => ({
    name: `room-${index}.jpg`,
    type: "image/jpeg",
    size: 1024,
  }))

  assert.equal(validateUploadFiles(tooMany).ok, false)
  assert.equal(
    validateUploadFiles([{ name: "room.jpg", type: "image/jpeg", size: CUSTOM_PAINTING_MAX_FILE_SIZE + 1 }]).ok,
    false
  )
  assert.equal(validateUploadFiles([{ name: "room.gif", type: "image/gif", size: 1024 }]).ok, false)
})

test("accepts only uploaded assets from the configured custom request namespace", () => {
  const validAsset = {
    key: "uploads/custom-requests/2026/06/request.jpg",
    url: "https://assets.yiiart.com/uploads/custom-requests/2026/06/request.jpg",
    contentType: "image/jpeg",
    size: 2048,
    originalName: "room.jpg",
  }
  const options = { assetBaseUrl: "https://assets.yiiart.com", r2Prefix: "uploads" }

  assert.equal(validateUploadedAssets([validAsset], options).ok, true)
  assert.equal(
    validateUploadedAssets([{ ...validAsset, key: "uploads/reviews/request.jpg" }], options).ok,
    false
  )
  assert.equal(
    validateUploadedAssets([{ ...validAsset, url: "https://example.com/request.jpg" }], options).ok,
    false
  )
})

test("builds a reviewable Sanity request document", () => {
  const result = validateCustomPaintingRequest(
    {
      ...validRequest,
      assets: [{
        key: "uploads/custom-requests/2026/06/request.jpg",
        url: "https://assets.yiiart.com/uploads/custom-requests/2026/06/request.jpg",
        contentType: "image/jpeg",
        size: 2048,
        originalName: "room.jpg",
      }],
    },
    { assetBaseUrl: "https://assets.yiiart.com", r2Prefix: "uploads" }
  )

  assert.equal(result.ok, true)
  if (!result.ok) return

  const document = buildCustomPaintingDocument(result.value, {
    id: "request-id",
    reference: "YAC-AB12CD34",
    submittedAt: "2026-06-29T00:00:00.000Z",
  })

  assert.equal(document._type, "customPaintingRequest")
  assert.equal(document.requestReference, "YAC-AB12CD34")
  assert.equal(document.customerEmail, "ada@example.com")
  assert.equal(document.status, "new")
  assert.equal(document.notificationStatus, "pending")
  assert.equal(document.referenceImages[0].key, "uploads/custom-requests/2026/06/request.jpg")
})
