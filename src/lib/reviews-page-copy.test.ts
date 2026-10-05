import assert from "node:assert/strict"
import test from "node:test"
import { getReviewsPageCopy } from "./reviews-page-copy"

test("does not claim collector feedback exists before any reviews are public", () => {
  const copy = getReviewsPageCopy(0)
  assert.equal(copy.eyebrow, "Verified Collector Feedback")
  assert.match(copy.description, /collecting our first verified reviews/i)
  assert.equal(copy.editorialNote, undefined)
})

test("describes published collector feedback once reviews are available", () => {
  const copy = getReviewsPageCopy(1)
  assert.equal(copy.eyebrow, "Real Reviews from Real Collectors")
  assert.match(copy.description, /Honest feedback from collectors/i)
  assert.match(copy.editorialNote || "", /only publish reviews connected to real collector experiences/i)
})
