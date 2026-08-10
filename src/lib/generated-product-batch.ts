import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import {
  calculateRolledPriceCny,
  getCatalogSizes,
  partitionRolledSizesForCheckout,
  type CatalogOrientation,
  type SizeProfileId,
} from "./storefront/catalog-config"

type GeneratedManifestProduct = {
  title: string
  slug: string
  seriesSlug: string
  widthCm: number
  heightCm: number
  orientation: CatalogOrientation
  materials: string[]
  secondRoom: "bedroom" | "dining_room"
  sanityDocumentId?: string | null
  status: string
  files: string[]
  sha256: Record<string, string>
}

type GeneratedBatchManifest = {
  schemaVersion: number
  batchId: string
  mediaProfile: string
  publicDisclosure: string
  preShipmentApprovalRequired: boolean
  reviewState: string
  operatorApproval?: {
    status?: string
    approvedBy?: string | null
    approvedAt?: string | null
  }
  products: GeneratedManifestProduct[]
}

type PublicationMetadata = {
  sizeProfile: SizeProfileId
  medium: "Acrylic on Canvas" | "Mixed Media"
  category: "Abstract" | "Landscape" | "Figurative" | "Minimalist"
  roomTypes: string[]
  colorFamilies: string[]
  styleTags: string[]
  shortDescription: string
  artworkStory: string
  materials: string
  surfaceFinish: string
  framingNotes: string
  seoKeywords: string[]
  socialCaption: string
}

const PRODUCT_METADATA: Record<string, PublicationMetadata> = {
  "quiet-geometry-01": {
    sizeProfile: "square",
    medium: "Mixed Media",
    category: "Minimalist",
    roomTypes: ["Living room", "Bedroom", "Office"],
    colorFamilies: ["Neutral", "Green", "Black", "White"],
    styleTags: ["Geometric", "Textured", "Neutral", "Modern"],
    shortDescription: "A hand-painted geometric composition in olive, ivory, and charcoal, made to order for calm modern interiors.",
    artworkStory: "Quiet Geometry balances architectural shapes with soft-edged layers and restrained relief. Each edition is painted by hand, so brushwork and texture vary naturally while preserving the approved composition.",
    materials: "Acrylic and texture paste on artist canvas, hand-painted to order.",
    surfaceFinish: "Layered matte acrylic with shallow texture-paste relief and visible handwork.",
    framingNotes: "Ships rolled for direct checkout. Stretching and framing can be discussed through the custom request service.",
    seoKeywords: ["geometric wall art", "olive green painting", "neutral textured painting", "square modern canvas art"],
    socialCaption: "Quiet Geometry 01 brings olive, ivory, and charcoal into a balanced hand-painted composition for modern rooms.",
  },
  "gilded-shore-01": {
    sizeProfile: "two-three",
    medium: "Mixed Media",
    category: "Landscape",
    roomTypes: ["Living room", "Dining room", "Office", "Hospitality space"],
    colorFamilies: ["Neutral", "Blue", "Yellow", "Earth tone"],
    styleTags: ["Textured", "Coastal", "Neutral", "Modern"],
    shortDescription: "A hand-painted abstract shoreline in ivory, taupe, gray-blue, and restrained gold, made to order in landscape proportions.",
    artworkStory: "Gilded Shore interprets a distant horizon through layered mineral tones and a quiet trace of gold. Hand-painted variations keep every finished canvas individual without changing the approved visual direction.",
    materials: "Acrylic and texture paste on artist canvas, with optional restrained gold foil accents.",
    surfaceFinish: "Soft matte strata, low impasto, and selective metallic detail.",
    framingNotes: "Ships rolled for direct checkout. Gold accents and framing preferences can be confirmed before production.",
    seoKeywords: ["neutral coastal painting", "gold textured wall art", "large landscape canvas", "taupe blue abstract art"],
    socialCaption: "Gilded Shore 01 layers a quiet gray-blue horizon with warm mineral tones and restrained gold.",
  },
  "ink-garden-01": {
    sizeProfile: "two-three",
    medium: "Mixed Media",
    category: "Abstract",
    roomTypes: ["Living room", "Bedroom", "Entryway", "Office"],
    colorFamilies: ["Green", "Neutral", "White"],
    styleTags: ["Botanical", "Ink-inspired", "Minimalist", "Modern"],
    shortDescription: "A hand-painted botanical abstraction with ink-green lines, sage washes, and generous cream space, made to order in portrait proportions.",
    artworkStory: "Ink Garden turns rain traces, translucent leaves, and gestural botanical lines into a calm vertical composition. The studio preserves the approved palette and structure while allowing natural hand-painted variation.",
    materials: "Acrylic and texture paste on artist canvas, using layered washes and fine botanical linework.",
    surfaceFinish: "Mostly matte with translucent washes, fine linework, and modest tactile texture.",
    framingNotes: "Ships rolled for direct checkout. Custom colors and float-frame recommendations are available on request.",
    seoKeywords: ["green botanical painting", "ink style wall art", "sage bedroom artwork", "vertical modern canvas"],
    socialCaption: "Ink Garden 01 pairs ink-green botanical lines with sage washes and calm cream space.",
  },
  "retro-ritual-01": {
    sizeProfile: "square",
    medium: "Mixed Media",
    category: "Figurative",
    roomTypes: ["Living room", "Dining room", "Entryway", "Hospitality space"],
    colorFamilies: ["Red", "Blue", "Green", "Neutral"],
    styleTags: ["Still life", "Retro", "Textured", "Modern"],
    shortDescription: "A hand-painted modern still life in cream, oxide red, ink blue, and eucalyptus, made to order as a square statement piece.",
    artworkStory: "Retro Ritual reduces a tea vessel, cup, branch, and table plane into a graphic still-life rhythm. Each canvas is painted by hand to retain the approved objects, palette, and balanced square format.",
    materials: "Acrylic and texture paste on artist canvas, built with opaque color fields and hand-finished surface detail.",
    surfaceFinish: "Matte acrylic fields with restrained texture and visible hand-painted edges.",
    framingNotes: "Ships rolled for direct checkout. A custom frame or coordinated color variation can be requested separately.",
    seoKeywords: ["retro still life painting", "red blue wall art", "square dining room artwork", "modern tea still life"],
    socialCaption: "Retro Ritual 01 reimagines a quiet tea setting through cream, oxide red, ink blue, and eucalyptus.",
  },
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/i

export function buildGeneratedProductPublicationPlan(
  manifestInput: unknown,
  options: { publicBaseUrl: string; objectPrefix?: string },
) {
  const manifest = readManifest(manifestInput)
  const publicBaseUrl = requiredString(options.publicBaseUrl, "A public R2 base URL is required").replace(/\/+$/, "")
  const objectPrefix = normalizePathPart(options.objectPrefix || "products/generated")
  assertOwnerApproval(manifest)
  assertUniqueSlugs(manifest.products)

  const products = manifest.products.map((product) => {
    validateProduct(product)
    const metadata = PRODUCT_METADATA[product.slug]
    if (!metadata) throw new Error(`No reviewed publication metadata exists for ${product.slug}.`)

    const directSizes = partitionRolledSizesForCheckout(
      getCatalogSizes(metadata.sizeProfile, product.orientation),
    ).direct
    const standardSizes = directSizes.map((size) => ({
      _key: `rolled-${size.id}`,
      _type: "standardSize" as const,
      label: size.label,
      widthCm: size.widthCm,
      heightCm: size.heightCm,
      priceCny: calculateRolledPriceCny(size.widthCm, size.heightCm)!,
    }))
    const documentId = product.sanityDocumentId
      ? validateSanityDocumentId(product.sanityDocumentId)
      : `yiiart-generated-${manifest.batchId}-${product.slug}`
    const media = product.files.map((sourceName, order) => {
      const role = mediaRole(sourceName)
      const sha256 = product.sha256[sourceName]
      const hashPrefix = sha256.slice(0, 12).toLowerCase()
      const r2Key = [objectPrefix, normalizePathPart(manifest.batchId), product.slug, `${String(order).padStart(2, "0")}-${role}-${hashPrefix}.webp`].join("/")

      return {
        _key: `${role}_${hashPrefix}`,
        _type: "productMedia" as const,
        mediaType: "image" as const,
        role,
        sourceName,
        sha256,
        r2Key,
        url: `${publicBaseUrl}/${r2Key}`,
        contentType: "image/webp",
        alt: mediaAlt(product.title, role),
        order,
        sortOrder: order + 1,
        sourceFolder: product.slug,
        sourceNote: `YiiArt-owned generated concept media, owner-approved for the ${manifest.batchId} made-to-order batch.`,
        approvedForStorefront: true as const,
      }
    })

    return {
      sourceFolder: product.slug,
      manifestSanityDocumentId: product.sanityDocumentId || null,
      media,
      document: {
        _id: documentId,
        _type: "artwork" as const,
        title: { en: product.title },
        slug: { _type: "slug" as const, current: product.slug },
        catalogCode: `generated:${manifest.batchId}:${product.slug}`,
        generatedBatchKey: `made_to_order_generated:${manifest.batchId}`,
        collectionType: "new_collection" as const,
        productionModel: "hand_painted_to_order" as const,
        seriesSlug: product.seriesSlug,
        sizeProfile: metadata.sizeProfile,
        rightsStatus: "approved" as const,
        migrationStatus: "ready" as const,
        price: standardSizes[0].priceCny,
        allowCheckout: true,
        availability: "available" as const,
        dimensions: `${product.widthCm} x ${product.heightCm} cm reference composition`,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        medium: metadata.medium,
        category: metadata.category,
        roomTypes: metadata.roomTypes,
        colorFamilies: metadata.colorFamilies,
        orientation: titleCase(product.orientation),
        styleTags: metadata.styleTags,
        standardSizes,
        frameOptions: [{
          _key: "rolled",
          _type: "frameOption" as const,
          label: "Rolled canvas",
          priceDeltaCny: 0,
        }],
        creationWindow: { en: "Production timing and approval stages are confirmed after ordering." },
        surfaceFinish: metadata.surfaceFinish,
        framingNotes: metadata.framingNotes,
        shippingProfile: "Ships rolled" as const,
        seoKeywords: metadata.seoKeywords,
        socialCaption: metadata.socialCaption,
        shortDescription: { en: metadata.shortDescription },
        description: { en: metadata.shortDescription },
        artworkStory: { en: metadata.artworkStory },
        materials: { en: metadata.materials },
        featured: product.slug === "ink-garden-01",
      },
    }
  })

  return {
    schemaVersion: 1,
    batchId: manifest.batchId,
    approval: manifest.operatorApproval,
    summary: {
      products: products.length,
      media: products.reduce((total, product) => total + product.media.length, 0),
    },
    products,
  }
}

export async function verifyGeneratedProductSourceFiles(
  plan: ReturnType<typeof buildGeneratedProductPublicationPlan>,
  sourceRoot: string,
) {
  let verifiedFiles = 0
  for (const product of plan.products) {
    for (const media of product.media) {
      const sourcePath = safeSourcePath(sourceRoot, product.sourceFolder, media.sourceName)
      let source: Buffer
      try {
        source = await readFile(sourcePath)
      } catch {
        throw new Error(`Generated product source file is missing: ${product.sourceFolder}/${media.sourceName}`)
      }
      const actualHash = createHash("sha256").update(source).digest("hex")
      if (actualHash.toLowerCase() !== media.sha256.toLowerCase()) {
        throw new Error(`Generated product source hash mismatch: ${product.sourceFolder}/${media.sourceName}`)
      }
      verifiedFiles += 1
    }
  }
  return { verifiedFiles }
}

export function resolveGeneratedR2ObjectAction(
  existing: { contentType?: string; metadata?: Record<string, string | undefined> } | null,
  expectedSourceHash: string,
) {
  if (!existing) return "upload" as const
  const recordedHash = existing.metadata?.["yiiart-source-sha256"]?.toLowerCase()
  if (existing.contentType === "image/webp" && recordedHash === expectedSourceHash.toLowerCase()) {
    return "skip" as const
  }
  throw new Error("Existing R2 object does not match the approved source hash and will not be overwritten.")
}

export function assertGeneratedPublishedProductMatchesPlan(
  existing: Record<string, any>,
  planned: ReturnType<typeof buildGeneratedProductPublicationPlan>["products"][number],
) {
  const expected = planned.document
  const canonicalFields: Array<[string, unknown, unknown]> = [
    ["_id", existing._id, expected._id],
    ["slug", existing.slug, expected.slug.current],
    ["catalogCode", existing.catalogCode, expected.catalogCode],
    ["generatedBatchKey", existing.generatedBatchKey, expected.generatedBatchKey],
    ["productionModel", existing.productionModel, expected.productionModel],
    ["collectionType", existing.collectionType, expected.collectionType],
    ["rightsStatus", existing.rightsStatus, expected.rightsStatus],
    ["migrationStatus", existing.migrationStatus, expected.migrationStatus],
    ["price", existing.price, expected.price],
    ["allowCheckout", existing.allowCheckout, expected.allowCheckout],
    ["shippingProfile", existing.shippingProfile, expected.shippingProfile],
    ["sizeProfile", existing.sizeProfile, expected.sizeProfile],
    ["seriesSlug", existing.seriesSlug, expected.seriesSlug],
    ["widthCm", existing.widthCm, expected.widthCm],
    ["heightCm", existing.heightCm, expected.heightCm],
    ["standardSizes", existing.standardSizes, expected.standardSizes],
    ["frameOptions", existing.frameOptions, expected.frameOptions],
  ]

  for (const [field, actual, wanted] of canonicalFields) {
    if (stableJson(actual) !== stableJson(wanted)) {
      throw new Error(`Published generated product canonical field mismatch: ${field}`)
    }
  }

  buildGeneratedMediaFieldPatch(existing.productMedia, planned.media)
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
    return `{${entries.join(",")}}`
  }
  return JSON.stringify(value)
}

export function buildGeneratedMediaFieldPatch(
  existingInput: unknown,
  plannedMedia: ReturnType<typeof buildGeneratedProductPublicationPlan>["products"][number]["media"],
) {
  const resolvedMedia = resolveGeneratedPublishedMedia(existingInput, plannedMedia)
  const patch: Record<string, string | number | boolean> = {}

  for (const media of resolvedMedia) {
    const basePath = `productMedia[_key=="${media._key}"]`
    patch[`${basePath}.role`] = media.role
    patch[`${basePath}.sortOrder`] = media.sortOrder
    patch[`${basePath}.alt`] = media.alt
    patch[`${basePath}.sourceNote`] = media.sourceNote
    patch[`${basePath}.approvedForStorefront`] = true
  }
  return patch
}

export function resolveGeneratedPublishedMedia(
  existingInput: unknown,
  plannedMedia: ReturnType<typeof buildGeneratedProductPublicationPlan>["products"][number]["media"],
) {
  const existingMedia = Array.isArray(existingInput) ? existingInput : []

  return plannedMedia.map((planned) => {
    const candidates = [{
      _key: planned._key,
      key: planned.r2Key,
      url: planned.url,
    }]
    if (planned.role === "dining_room") {
      candidates.push({
        _key: planned._key.replace("dining_room_", "other_"),
        key: planned.r2Key.replace("-dining_room-", "-other-"),
        url: planned.url.replace("-dining_room-", "-other-"),
      })
    }

    const existing = existingMedia.find((media) => candidates.some((candidate) => (
      media?._key === candidate._key
      && media?.key === candidate.key
      && media?.url === candidate.url
    )))
    if (!existing) {
      throw new Error(`Published generated product media mismatch: ${planned.r2Key}`)
    }

    return {
      ...planned,
      _key: existing._key as string,
      r2Key: existing.key as string,
      url: existing.url as string,
    }
  })
}

function readManifest(value: unknown): GeneratedBatchManifest {
  if (!value || typeof value !== "object") throw new Error("Generated product manifest must be an object.")
  const manifest = value as GeneratedBatchManifest
  if (manifest.schemaVersion !== 1) throw new Error("Generated product manifest schemaVersion must be 1.")
  if (manifest.mediaProfile !== "made_to_order_generated") throw new Error("Generated product manifest media profile is not supported.")
  if (manifest.publicDisclosure !== "made_to_order" || manifest.preShipmentApprovalRequired !== true) {
    throw new Error("Generated product manifest must use the made-to-order pre-shipment approval model.")
  }
  requiredString(manifest.batchId, "Generated product manifest batchId is required")
  if (!SAFE_SLUG_PATTERN.test(manifest.batchId)) {
    throw new Error("Generated product manifest batchId must be a safe ASCII slug.")
  }
  if (!Array.isArray(manifest.products) || manifest.products.length === 0) {
    throw new Error("Generated product manifest must contain products.")
  }
  return manifest
}

function assertOwnerApproval(manifest: GeneratedBatchManifest) {
  if (
    !["owner_approved_for_publication", "published"].includes(manifest.reviewState)
    || manifest.operatorApproval?.status !== "approved"
    || !manifest.operatorApproval.approvedBy
    || !manifest.operatorApproval.approvedAt
  ) {
    throw new Error("Owner approval must be recorded before generated products can be published.")
  }
}

function assertUniqueSlugs(products: GeneratedManifestProduct[]) {
  const slugs = new Set<string>()
  for (const product of products) {
    const slug = requiredString(product.slug, "Every generated product requires a slug")
    if (slugs.has(slug)) throw new Error(`Duplicate slug in generated product manifest: ${slug}`)
    slugs.add(slug)
  }
}

function validateProduct(product: GeneratedManifestProduct) {
  if (!SAFE_SLUG_PATTERN.test(product.slug || "")) {
    throw new Error(`${product.slug || "Generated product"} must use a safe ASCII slug.`)
  }
  if (!["approved_local", "published"].includes(product.status)) {
    throw new Error(`${product.slug} is not locally approved.`)
  }
  if (!Number.isFinite(product.widthCm) || product.widthCm <= 0 || !Number.isFinite(product.heightCm) || product.heightCm <= 0) {
    throw new Error(`${product.slug} requires valid physical reference dimensions.`)
  }
  if (!(["portrait", "landscape", "square"] as string[]).includes(product.orientation)) {
    throw new Error(`${product.slug} has an invalid orientation.`)
  }

  const expectedFiles = expectedProductFiles(product.secondRoom)
  if (product.files.length !== expectedFiles.length || expectedFiles.some((name, index) => product.files[index] !== name)) {
    throw new Error(`${product.slug} expected files: ${expectedFiles.join(", ")}.`)
  }

  for (const sourceName of expectedFiles) {
    if (!SHA256_PATTERN.test(product.sha256[sourceName] || "")) {
      throw new Error(`${product.slug}/${sourceName} requires a valid audited SHA-256 hash.`)
    }
  }
}

function validateSanityDocumentId(value: string) {
  const id = value.trim()
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(id) || id.startsWith("drafts.")) {
    throw new Error(`Invalid published Sanity document ID in generated product manifest: ${value}`)
  }
  return id
}

function expectedProductFiles(secondRoom: GeneratedManifestProduct["secondRoom"]) {
  const secondRoomFile = secondRoom === "dining_room" ? "05-dining-room.png" : "05-bedroom.png"
  return ["01-front.png", "02-detail.png", "03-side.png", "04-living-room.png", secondRoomFile, "06-size-reference.png"]
}

function mediaRole(filename: string) {
  if (filename.includes("front")) return "front" as const
  if (filename.includes("detail")) return "detail" as const
  if (filename.includes("side")) return "angle" as const
  if (filename.includes("living-room")) return "living_room" as const
  if (filename.includes("bedroom")) return "bedroom" as const
  if (filename.includes("dining-room")) return "dining_room" as const
  if (filename.includes("size-reference")) return "scale" as const
  return "other" as const
}

function mediaAlt(title: string, role: ReturnType<typeof mediaRole>) {
  const labels: Record<ReturnType<typeof mediaRole>, string> = {
    front: "front view",
    detail: "texture detail",
    angle: "side and edge view",
    living_room: "living room scale view",
    bedroom: "bedroom scale view",
    dining_room: "dining room scale view",
    scale: "size reference",
    other: "additional view",
  }
  return `${title} handmade made-to-order painting, ${labels[role]}`
}

function requiredString(value: unknown, message: string) {
  const normalized = typeof value === "string" ? value.trim() : ""
  if (!normalized) throw new Error(message)
  return normalized
}

function normalizePathPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-+/g, "-")
}

function safeSourcePath(sourceRoot: string, sourceFolder: string, sourceName: string) {
  const root = path.resolve(sourceRoot)
  const candidate = path.resolve(root, sourceFolder, sourceName)
  if (!candidate.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Generated product source path escapes the approved directory: ${sourceFolder}/${sourceName}`)
  }
  return candidate
}

function titleCase(value: CatalogOrientation) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
