import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import sharp from "sharp"
import { getFinishThumbnailSrc } from "./finish-selector"
import thumbnails from "./finish-thumbnails.json"

test("finish previews resolve to compact existing images", async () => {
  let sourceBytes = 0
  let previewBytes = 0
  for (const [source, preview] of Object.entries(thumbnails)) {
    assert.equal(getFinishThumbnailSrc(source), preview)
    const original = await readFile(`public${source}`)
    const output = await readFile(`public${preview}`)
    const metadata = await sharp(output).metadata()
    assert.equal(metadata.format, "webp")
    assert.ok(metadata.width && metadata.width <= 176)
    assert.ok(metadata.height && metadata.height <= 176)
    sourceBytes += original.length
    previewBytes += output.length
  }
  assert.equal(Object.keys(thumbnails).length, 7)
  assert.ok(previewBytes < sourceBytes / 2)
})

test("unmapped finish imagery retains its original source", () => {
  assert.equal(getFinishThumbnailSrc("https://assets.yiiart.com/new-finish.webp"), "https://assets.yiiart.com/new-finish.webp")
})
