import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { calculateArtworkWidthRange, sofaArtworkSizeExamples } from "./wall-art-sizing"

test("calculates a 60%-75% artwork width range in centimeters and inches", () => {
  assert.deepEqual(calculateArtworkWidthRange(180), {
    furnitureWidthCm: 180,
    minArtworkWidthCm: 108,
    maxArtworkWidthCm: 135,
    minArtworkWidthIn: 42.5,
    maxArtworkWidthIn: 53.1,
  })
})

test("rejects non-positive and non-finite furniture widths", () => {
  assert.equal(calculateArtworkWidthRange(0), null)
  assert.equal(calculateArtworkWidthRange(-120), null)
  assert.equal(calculateArtworkWidthRange(Number.NaN), null)
  assert.equal(calculateArtworkWidthRange(Number.POSITIVE_INFINITY), null)
})

test("publishes varied sofa-width examples with derived art ranges", () => {
  assert.deepEqual(sofaArtworkSizeExamples.map((row) => row.furnitureWidthCm), [140, 160, 180, 200, 220, 240])
  assert.equal(sofaArtworkSizeExamples.every((row) => row.minArtworkWidthCm < row.maxArtworkWidthCm), true)
  assert.equal(sofaArtworkSizeExamples.every((row) => row.minArtworkWidthIn < row.maxArtworkWidthIn), true)
})

test("keeps detailed sofa sizing on the size guide and links to it from the broad pairing guide", async () => {
  const pairingGuide = await readFile("src/app/guides/home-wall-art-pairing-guide/page.tsx", "utf8")

  assert.doesNotMatch(pairingGuide, /60%-75%/)
  assert.match(pairingGuide, /href="\/size-guide"/)
  assert.match(pairingGuide, /sofa-width chart/i)
})

test("keeps both metric and imperial size ranges visible without a fixed-width table", async () => {
  const sizeGuide = await readFile("src/app/size-guide/page.tsx", "utf8")

  assert.doesNotMatch(sizeGuide, /min-w-\[620px\]/)
  assert.match(sizeGuide, /Artwork width \(cm \/ in\)/)
  assert.match(sizeGuide, /row\.minArtworkWidthIn/)
})
