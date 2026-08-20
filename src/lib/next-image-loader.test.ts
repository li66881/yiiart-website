import assert from "node:assert/strict"
import test from "node:test"
import { buildImageLoaderUrl } from "./next-image-loader"

test("resizes Sanity images on their CDN instead of /_next/image", () => {
  const src =
    "https://cdn.sanity.io/images/zlh03v8i/production/afd8d61452b76159293b077fe68c354f936b3b.jpg?w=1400"

  const url = new URL(
    buildImageLoaderUrl({ src, width: 128, quality: 75 })
  )

  assert.equal(url.searchParams.get("w"), "128")
  assert.equal(url.searchParams.get("q"), "75")
  assert.equal(url.searchParams.get("auto"), "format")
  assert.equal(url.searchParams.get("fit"), "max")
})

test("leaves R2 and local public files on their original URLs", () => {
  assert.equal(
    buildImageLoaderUrl({
      src: "https://assets.yiiart.com/uploads/product-videos/sofie/jj-013/poster.jpg",
      width: 128,
      quality: 75,
    }),
    "https://assets.yiiart.com/uploads/product-videos/sofie/jj-013/poster.jpg"
  )
  assert.equal(
    buildImageLoaderUrl({ src: "/images/product-finishes/oak.webp", width: 96 }),
    "/images/product-finishes/oak.webp"
  )
})
