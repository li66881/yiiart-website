import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import {
  assertGeneratedPublishedProductMatchesPlan,
  buildGeneratedProductPublicationPlan,
  buildGeneratedMediaFieldPatch,
  resolveGeneratedPublishedMedia,
  resolveGeneratedR2ObjectAction,
  verifyGeneratedProductSourceFiles,
} from "./generated-product-batch"

const approvedManifest = {
  schemaVersion: 1,
  batchId: "2026-first-batch",
  mediaProfile: "made_to_order_generated",
  publicDisclosure: "made_to_order",
  preShipmentApprovalRequired: true,
  reviewState: "owner_approved_for_publication",
  operatorApproval: {
    status: "approved",
    approvedBy: "YiiArt owner",
    approvedAt: "2026-08-10T14:10:00.000Z",
  },
  products: [
    {
      title: "Quiet Geometry 01",
      slug: "quiet-geometry-01",
      seriesSlug: "quiet-geometry",
      widthCm: 100,
      heightCm: 100,
      orientation: "square",
      materials: ["acrylic", "texture paste"],
      secondRoom: "bedroom",
      sanityDocumentId: null as string | null,
      status: "approved_local",
      files: [
        "01-front.png",
        "02-detail.png",
        "03-side.png",
        "04-living-room.png",
        "05-bedroom.png",
        "06-size-reference.png",
      ],
      sha256: {
        "01-front.png": "A".repeat(64),
        "02-detail.png": "B".repeat(64),
        "03-side.png": "C".repeat(64),
        "04-living-room.png": "D".repeat(64),
        "05-bedroom.png": "E".repeat(64),
        "06-size-reference.png": "F".repeat(64),
      },
    },
  ],
}

test("builds a direct-checkout Sanity product and six deterministic R2 media entries", () => {
  const plan = buildGeneratedProductPublicationPlan(approvedManifest, {
    publicBaseUrl: "https://art-media.yiiart.com/",
    objectPrefix: "products/generated",
  })

  assert.equal(plan.summary.products, 1)
  assert.equal(plan.summary.media, 6)
  assert.equal(plan.products[0].document._id, "yiiart-generated-2026-first-batch-quiet-geometry-01")
  assert.equal(plan.products[0].document.generatedBatchKey, "made_to_order_generated:2026-first-batch")
  assert.equal(plan.products[0].document.sizeProfile, "square")
  assert.equal(plan.products[0].document.shippingProfile, "Ships rolled")
  assert.equal(plan.products[0].document.allowCheckout, true)
  assert.deepEqual(plan.products[0].document.standardSizes[0], {
    _key: "rolled-60x60",
    _type: "standardSize",
    label: "60 x 60 cm",
    widthCm: 60,
    heightCm: 60,
    priceCny: 1730,
  })
  assert.deepEqual(
    plan.products[0].media.map((item) => item.role),
    ["front", "detail", "angle", "living_room", "bedroom", "scale"],
  )
  assert.deepEqual(plan.products[0].media.map((item) => item.sortOrder), [1, 2, 3, 4, 5, 6])
  assert.equal(
    plan.products[0].media[0].r2Key,
    "products/generated/2026-first-batch/quiet-geometry-01/00-front-aaaaaaaaaaaa.webp",
  )
  assert.equal(
    plan.products[0].media[0].url,
    "https://art-media.yiiart.com/products/generated/2026-first-batch/quiet-geometry-01/00-front-aaaaaaaaaaaa.webp",
  )
})

test("keeps generated products private until the owner approval is recorded", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.reviewState = "owner_review_required"
  manifest.operatorApproval.status = "owner_review_required"

  assert.throws(
    () => buildGeneratedProductPublicationPlan(manifest, { publicBaseUrl: "https://art-media.yiiart.com" }),
    /owner approval/i,
  )
})

test("allows an owner-approved published manifest to be verified idempotently", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.reviewState = "published"
  manifest.products[0].status = "published"

  const plan = buildGeneratedProductPublicationPlan(manifest, {
    publicBaseUrl: "https://art-media.yiiart.com",
  })

  assert.equal(plan.summary.products, 1)
})

test("rejects duplicate product slugs before any publication plan is built", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.products.push(structuredClone(manifest.products[0]))

  assert.throws(
    () => buildGeneratedProductPublicationPlan(manifest, { publicBaseUrl: "https://art-media.yiiart.com" }),
    /duplicate slug.*quiet-geometry-01/i,
  )
})

test("uses a previously recorded Sanity document ID for idempotent verification", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.products[0].sanityDocumentId = "sanity-recorded-product-id"

  const plan = buildGeneratedProductPublicationPlan(manifest, {
    publicBaseUrl: "https://art-media.yiiart.com",
  })

  assert.equal(plan.products[0].document._id, "sanity-recorded-product-id")
  assert.equal(plan.products[0].manifestSanityDocumentId, "sanity-recorded-product-id")
})

test("rejects a product slug that can escape the approved source directory", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.products[0].slug = "../quiet-geometry-01"

  assert.throws(
    () => buildGeneratedProductPublicationPlan(manifest, { publicBaseUrl: "https://art-media.yiiart.com" }),
    /safe ascii slug/i,
  )
})

test("rejects an incomplete six-role product folder", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.products[0].files.pop()

  assert.throws(
    () => buildGeneratedProductPublicationPlan(manifest, { publicBaseUrl: "https://art-media.yiiart.com" }),
    /expected files/i,
  )
})

test("rejects a source image whose bytes changed after owner approval", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "yiiart-generated-batch-"))
  try {
    const productRoot = path.join(root, "quiet-geometry-01")
    await import("node:fs/promises").then(({ mkdir }) => mkdir(productRoot))
    await Promise.all(approvedManifest.products[0].files.map((name) => (
      writeFile(path.join(productRoot, name), name === "01-front.png" ? "changed" : name)
    )))
    const plan = buildGeneratedProductPublicationPlan(approvedManifest, {
      publicBaseUrl: "https://art-media.yiiart.com",
    })

    await assert.rejects(
      () => verifyGeneratedProductSourceFiles(plan, root),
      /source hash mismatch.*quiet-geometry-01.*01-front\.png/i,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("uploads a generated R2 object only when the deterministic key is absent", () => {
  assert.equal(resolveGeneratedR2ObjectAction(null, "A".repeat(64)), "upload")
  assert.equal(resolveGeneratedR2ObjectAction({
    contentType: "image/webp",
    metadata: { "yiiart-source-sha256": "A".repeat(64).toLowerCase() },
  }, "A".repeat(64)), "skip")
})

test("fails closed instead of overwriting an existing R2 key with unknown bytes", () => {
  assert.throws(
    () => resolveGeneratedR2ObjectAction({
      contentType: "image/webp",
      metadata: { "yiiart-source-sha256": "B".repeat(64).toLowerCase() },
    }, "A".repeat(64)),
    /existing r2 object.*hash/i,
  )
})

test("fails closed when a published generated product price drifts from the approved plan", () => {
  const plan = buildGeneratedProductPublicationPlan(approvedManifest, {
    publicBaseUrl: "https://art-media.yiiart.com",
  })
  const product = plan.products[0]
  const published = {
    ...structuredClone(product.document),
    slug: product.document.slug.current,
    price: product.document.price + 10,
    productMedia: product.media.map((media) => ({
      _key: media._key,
      key: media.r2Key,
      url: media.url,
    })),
  }

  assert.throws(
    () => assertGeneratedPublishedProductMatchesPlan(published, product),
    /canonical field.*price/i,
  )
})

test("builds targeted media patches and preserves unrelated later media", () => {
  const plan = buildGeneratedProductPublicationPlan(approvedManifest, {
    publicBaseUrl: "https://art-media.yiiart.com",
  })
  const product = plan.products[0]
  const existingMedia = [
    ...product.media.map((media) => ({
      _key: media._key,
      key: media.r2Key,
      url: media.url,
      role: media.role,
      sortOrder: 99,
    })),
    { _key: "later_video", key: "products/later-video.mp4", url: "https://art-media.yiiart.com/products/later-video.mp4" },
  ]

  const patch = buildGeneratedMediaFieldPatch(existingMedia, product.media)

  assert.equal(patch[`productMedia[_key=="${product.media[0]._key}"].sortOrder`], 1)
  assert.equal(patch[`productMedia[_key=="${product.media[0]._key}"].role`], "front")
  assert.equal(Object.keys(patch).some((key) => key.includes("later_video")), false)
})

test("publishes the approved second room as a dining-room gallery role", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.products[0].secondRoom = "dining_room"
  manifest.products[0].files[4] = "05-dining-room.png"
  const hashes = manifest.products[0].sha256 as Record<string, string>
  hashes["05-dining-room.png"] = hashes["05-bedroom.png"]
  delete hashes["05-bedroom.png"]

  const plan = buildGeneratedProductPublicationPlan(manifest, {
    publicBaseUrl: "https://art-media.yiiart.com",
  })

  assert.equal(plan.products[0].media[4].role, "dining_room")
  assert.match(plan.products[0].media[4].alt, /dining room scale view/i)
})

test("reuses a legacy other-role R2 object when migrating it to dining room", () => {
  const manifest = structuredClone(approvedManifest)
  manifest.products[0].secondRoom = "dining_room"
  manifest.products[0].files[4] = "05-dining-room.png"
  const hashes = manifest.products[0].sha256 as Record<string, string>
  hashes["05-dining-room.png"] = hashes["05-bedroom.png"]
  delete hashes["05-bedroom.png"]

  const plan = buildGeneratedProductPublicationPlan(manifest, {
    publicBaseUrl: "https://art-media.yiiart.com",
  })
  const product = plan.products[0]
  const existingMedia = product.media.map((media) => ({
    _key: media._key,
    key: media.r2Key,
    url: media.url,
  }))
  const diningMedia = existingMedia[4]
  diningMedia._key = diningMedia._key.replace("dining_room_", "other_")
  diningMedia.key = diningMedia.key.replace("-dining_room-", "-other-")
  diningMedia.url = diningMedia.url.replace("-dining_room-", "-other-")

  const resolved = resolveGeneratedPublishedMedia(existingMedia, product.media)
  const patch = buildGeneratedMediaFieldPatch(existingMedia, product.media)

  assert.match(resolved[4].r2Key, /-other-/)
  assert.equal(resolved[4].role, "dining_room")
  assert.equal(patch[`productMedia[_key=="${diningMedia._key}"].role`], "dining_room")
})
