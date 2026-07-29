import assert from "node:assert/strict"
import test from "node:test"
import {
  buildProductMediaEntries,
  resolveProductMediaImport,
  type MediaAuditFolder,
  type ProductMediaReviewConfig,
} from "./product-media-import"

const readyFolder: MediaAuditFolder = {
  sourceFolder: "40-40-1",
  readyForUpload: true,
  suggestedMatch: {
    artworkId: "artwork-1",
    slug: "purple-line-gesture",
    title: "Purple Line Gesture",
  },
  files: [
    {
      name: "01-white-bg-front.png",
      mediaType: "image",
      role: "front",
      sha256: "aaaaaaaaaaaaaaaa",
      width: 1600,
      height: 1600,
    },
  ],
}

test("explicit exclusion prevents a folder from being imported", () => {
  const config: ProductMediaReviewConfig = {
    autoApproveReadyFolders: true,
    decisions: {
      "40-40-1": {
        status: "excluded",
        notes: "Wrong product.",
      },
    },
  }

  assert.deepEqual(resolveProductMediaImport(readyFolder, config), {
    status: "excluded",
    sourceFolder: "40-40-1",
    reason: "Wrong product.",
  })
})

test("approved size correction overrides the source folder dimensions", () => {
  const config: ProductMediaReviewConfig = {
    autoApproveReadyFolders: false,
    decisions: {
      "400-400-12": {
        status: "approved_with_size_correction",
        artworkId: "artwork-pink",
        slug: "pink-garden-rhythm",
        correctedCatalogCode: "40-40-12",
        correctedPhysicalSize: {
          widthCm: 40,
          heightCm: 40,
        },
      },
    },
  }
  const folder: MediaAuditFolder = {
    ...readyFolder,
    sourceFolder: "400-400-12",
    readyForUpload: false,
    suggestedMatch: null,
  }

  assert.deepEqual(resolveProductMediaImport(folder, config), {
    status: "approved",
    approval: "approved_with_size_correction",
    sourceFolder: "400-400-12",
    artworkId: "artwork-pink",
    slug: "pink-garden-rhythm",
    title: "Pink Garden Rhythm",
    catalogCode: "40-40-12",
    correctedPhysicalSize: {
      widthCm: 40,
      heightCm: 40,
    },
    notes: "",
    files: folder.files,
  })
})

test("ready folders use their unique audited match when auto approval is enabled", () => {
  const config: ProductMediaReviewConfig = {
    autoApproveReadyFolders: true,
    decisions: {},
  }

  const resolution = resolveProductMediaImport(readyFolder, config)
  assert.equal(resolution.status, "approved")
  if (resolution.status !== "approved") {
    assert.fail("Expected the ready folder to be approved")
  }
  assert.equal(resolution.slug, "purple-line-gesture")
})

test("incomplete folders stay on hold without an explicit approval", () => {
  const config: ProductMediaReviewConfig = {
    autoApproveReadyFolders: true,
    decisions: {},
  }
  const folder: MediaAuditFolder = {
    ...readyFolder,
    sourceFolder: "30-40-10",
    readyForUpload: false,
  }

  assert.deepEqual(resolveProductMediaImport(folder, config), {
    status: "hold",
    sourceFolder: "30-40-10",
    reason: "Folder is not explicitly approved and did not pass the automated upload gate.",
  })
})

test("media entries retain distinct same-role views and use deterministic R2 keys", () => {
  const resolved = {
    status: "approved" as const,
    approval: "approved_partial",
    sourceFolder: "30-40-5",
    artworkId: "artwork-mint",
    slug: "mint-field",
    title: "Mint Field",
    catalogCode: "30-40-5",
    correctedPhysicalSize: null,
    notes: "",
    files: [
      {
        name: "01-white-bg-front.png",
        mediaType: "image" as const,
        role: "front",
        sha256: "1111111111111111",
        width: 1200,
        height: 1600,
      },
      {
        name: "04-scene-angle.png",
        mediaType: "image" as const,
        role: "angle",
        sha256: "2222222222222222",
        width: 1600,
        height: 1200,
      },
      {
        name: "04-scene-angle..png",
        mediaType: "image" as const,
        role: "angle",
        sha256: "3333333333333333",
        width: 1600,
        height: 1200,
      },
    ],
  }

  assert.deepEqual(
    buildProductMediaEntries(resolved, {
      publicBaseUrl: "https://assets.yiiart.com/",
      objectPrefix: "products",
    }).map((item) => ({
      role: item.role,
      order: item.order,
      r2Key: item.r2Key,
      url: item.url,
      alt: item.alt,
    })),
    [
      {
        role: "front",
        order: 0,
        r2Key: "products/mint-field/30-40-5/00-front-111111111111.webp",
        url: "https://assets.yiiart.com/products/mint-field/30-40-5/00-front-111111111111.webp",
        alt: "Mint Field handmade painting, front view",
      },
      {
        role: "angle",
        order: 1,
        r2Key: "products/mint-field/30-40-5/01-angle-222222222222.webp",
        url: "https://assets.yiiart.com/products/mint-field/30-40-5/01-angle-222222222222.webp",
        alt: "Mint Field handmade painting, angle view",
      },
      {
        role: "angle",
        order: 2,
        r2Key: "products/mint-field/30-40-5/02-angle-333333333333.webp",
        url: "https://assets.yiiart.com/products/mint-field/30-40-5/02-angle-333333333333.webp",
        alt: "Mint Field handmade painting, additional angle view",
      },
    ],
  )
})
