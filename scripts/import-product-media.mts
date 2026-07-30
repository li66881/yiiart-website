import { createHash } from "node:crypto"
import path from "node:path"
import fs from "node:fs"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createClient } from "@sanity/client"
import sharp from "sharp"
import {
  buildProductMediaEntries,
  resolveProductMediaImport,
  type ApprovedProductMediaImport,
  type MediaAuditFolder,
  type ProductMediaImportEntry,
  type ProductMediaReviewConfig,
} from "../src/lib/product-media-import"

loadEnvFile(".env.local")

const args = parseArgs(process.argv.slice(2))
const sourceDirectory = path.resolve(args.source || process.env.YIIART_MEDIA_SOURCE || "")
const auditPath = path.resolve(args.audit || "reports/product-media-audit.json")
const decisionsPath = path.resolve(args.decisions || "reports/product-media-review-decisions.json")
const planPath = path.resolve(args.plan || "reports/product-media-import-plan.json")
const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
  || process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
  || "https://assets.yiiart.com"
const objectPrefix = process.env.CLOUDFLARE_R2_PRODUCT_PREFIX || "products"

if (!sourceDirectory || !fs.existsSync(sourceDirectory) || !fs.statSync(sourceDirectory).isDirectory()) {
  throw new Error('Provide --source="C:\\path\\to\\media" or set YIIART_MEDIA_SOURCE.')
}

const audit = readJson<{ folders: MediaAuditFolder[] }>(auditPath)
const review = readJson<ProductMediaReviewConfig>(decisionsPath)
const allResolutions = audit.folders.map((folder) => resolveProductMediaImport(folder, review))
const approved = allResolutions.filter((item): item is ApprovedProductMediaImport => item.status === "approved")
const excluded = allResolutions.filter((item) => item.status === "excluded")
const held = allResolutions.filter((item) => item.status === "hold")
const selected = selectApproved(approved, args)
const planItems = selected.map((item) => ({
  ...item,
  media: buildProductMediaEntries(item, { publicBaseUrl, objectPrefix }),
}))
const missingSourceFiles = planItems.flatMap((item) => item.media
  .filter((media) => !fs.existsSync(path.join(sourceDirectory, item.sourceFolder, media.sourceName)))
  .map((media) => path.join(item.sourceFolder, media.sourceName)))

const plan = {
  generatedAt: new Date().toISOString(),
  applyRequested: args.apply,
  sourceDirectory,
  auditPath,
  decisionsPath,
  summary: {
    approvedProducts: approved.length,
    selectedProducts: selected.length,
    excludedFolders: excluded.length,
    heldFolders: held.length,
    selectedMediaFiles: planItems.reduce((total, item) => total + item.media.length, 0),
    missingSourceFiles: missingSourceFiles.length,
  },
  excluded,
  held,
  missingSourceFiles,
  products: planItems,
}

fs.mkdirSync(path.dirname(planPath), { recursive: true })
fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`)

console.log(`Approved products: ${plan.summary.approvedProducts}`)
console.log(`Selected products: ${plan.summary.selectedProducts}`)
console.log(`Selected media files: ${plan.summary.selectedMediaFiles}`)
console.log(`Excluded folders: ${plan.summary.excludedFolders}`)
console.log(`Held folders: ${plan.summary.heldFolders}`)
console.log(`Missing source files: ${plan.summary.missingSourceFiles}`)
console.log(`Plan: ${planPath}`)

if (missingSourceFiles.length > 0) {
  throw new Error("The import plan contains missing source files. No upload was attempted.")
}

if (!args.apply) {
  console.log("Dry run only. Add --apply after reviewing the generated plan.")
  process.exit(0)
}

const runtime = createRuntime()

for (const item of planItems) {
  await importProductMedia(item, runtime)
}

console.log(`Completed production import for ${planItems.length} product(s).`)

async function importProductMedia(
  item: ApprovedProductMediaImport & { media: ProductMediaImportEntry[] },
  runtime: ReturnType<typeof createRuntime>,
) {
  const artwork = await runtime.sanity.fetch<{
    _id: string
    slug: string
    catalogCode?: string
    productMedia?: Array<{ key?: string }>
  } | null>(
    `*[_type == "artwork" && _id == $id][0]{
      _id,
      "slug": slug.current,
      catalogCode,
      productMedia[]{key}
    }`,
    { id: item.artworkId },
  )

  if (!artwork || artwork.slug !== item.slug) {
    throw new Error(`Sanity artwork identity check failed for ${item.sourceFolder} -> ${item.slug}.`)
  }

  const existingKeys = new Set((artwork.productMedia || []).map((media) => media.key).filter(Boolean))
  const pendingMedia = item.media.filter((media) => !existingKeys.has(media.r2Key))
  const uploadedMedia = []

  for (const media of pendingMedia) {
    const sourcePath = path.join(sourceDirectory, item.sourceFolder, media.sourceName)
    verifySourceHash(sourcePath, item.files.find((file) => file.name === media.sourceName)?.sha256 || "")
    const prepared = await prepareMedia(sourcePath, media)

    await runtime.r2.send(new PutObjectCommand({
      Bucket: runtime.bucket,
      Key: media.r2Key,
      Body: prepared.body,
      ContentType: prepared.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }))

    uploadedMedia.push({
      _key: media._key,
      _type: "productMedia",
      mediaType: media.mediaType,
      role: media.role,
      url: media.url,
      key: media.r2Key,
      contentType: prepared.contentType,
      alt: media.alt,
      width: prepared.width,
      height: prepared.height,
      sortOrder: media.order,
      sourceFolder: media.sourceFolder,
      sourceNote: media.sourceNote,
      approvedForStorefront: true,
    })
  }

  let patch = runtime.sanity
    .patch(item.artworkId)
    .setIfMissing({
      catalogCode: item.catalogCode,
      productMedia: [],
    })

  if (item.correctedPhysicalSize) {
    patch = patch.set({
      catalogCode: item.catalogCode,
      widthCm: item.correctedPhysicalSize.widthCm,
      heightCm: item.correctedPhysicalSize.heightCm,
    })
  }

  if (uploadedMedia.length > 0) {
    patch = patch.append("productMedia", uploadedMedia)
  }

  if (uploadedMedia.length > 0 || item.correctedPhysicalSize || !artwork.catalogCode) {
    await patch.commit({ autoGenerateArrayKeys: true })
  }

  console.log(`${item.slug}: uploaded ${uploadedMedia.length}, already present ${item.media.length - uploadedMedia.length}`)
}

async function prepareMedia(sourcePath: string, media: ProductMediaImportEntry) {
  const source = fs.readFileSync(sourcePath)

  if (media.mediaType === "video") {
    return {
      body: source,
      contentType: media.contentType,
      width: media.width,
      height: media.height,
    }
  }

  const result = await sharp(source)
    .rotate()
    .resize({
      width: 2200,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: 86,
      effort: 5,
    })
    .toBuffer({ resolveWithObject: true })

  return {
    body: result.data,
    contentType: "image/webp",
    width: result.info.width,
    height: result.info.height,
  }
}

function createRuntime() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const sanityToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN

  const missing = [
    ["CLOUDFLARE_R2_ACCOUNT_ID", accountId],
    ["CLOUDFLARE_R2_BUCKET", bucket],
    ["CLOUDFLARE_R2_ACCESS_KEY_ID", accessKeyId],
    ["CLOUDFLARE_R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["CLOUDFLARE_R2_PUBLIC_URL", publicBaseUrl],
    ["SANITY_WRITE_TOKEN", sanityToken],
  ].filter(([, value]) => !value).map(([name]) => name)

  if (missing.length > 0) {
    throw new Error(`Production import credentials are missing: ${missing.join(", ")}`)
  }

  return {
    bucket: bucket as string,
    r2: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    }),
    sanity: createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token: sanityToken as string,
      useCdn: false,
    }),
  }
}

function verifySourceHash(sourcePath: string, expectedHash: string) {
  const actualHash = createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex")
  if (!expectedHash || actualHash !== expectedHash) {
    throw new Error(`Source file changed after audit: ${sourcePath}`)
  }
}

function selectApproved(approved: ApprovedProductMediaImport[], values: ParsedArgs) {
  const folders = values.folders
    ? new Set(values.folders.split(",").map((value) => value.trim()).filter(Boolean))
    : null
  const filtered = folders ? approved.filter((item) => folders.has(item.sourceFolder)) : approved
  return values.limit ? filtered.slice(0, values.limit) : filtered
}

type ParsedArgs = {
  apply: boolean
  source?: string
  audit?: string
  decisions?: string
  plan?: string
  folders?: string
  limit?: number
}

function parseArgs(values: string[]): ParsedArgs {
  return values.reduce<ParsedArgs>((result, value) => {
    if (value === "--apply") result.apply = true
    else if (value.startsWith("--source=")) result.source = value.slice("--source=".length)
    else if (value.startsWith("--audit=")) result.audit = value.slice("--audit=".length)
    else if (value.startsWith("--decisions=")) result.decisions = value.slice("--decisions=".length)
    else if (value.startsWith("--plan=")) result.plan = value.slice("--plan=".length)
    else if (value.startsWith("--folders=")) result.folders = value.slice("--folders=".length)
    else if (value.startsWith("--limit=")) result.limit = Math.max(0, Number(value.slice("--limit=".length)) || 0)
    return result
  }, { apply: false })
}

function readJson<T>(filePath: string) {
  if (!fs.existsSync(filePath)) throw new Error(`Required file was not found: ${filePath}`)
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T
}

function loadEnvFile(filename: string) {
  const envPath = path.resolve(filename)
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator < 1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "")
    if (!(key in process.env)) process.env[key] = value
  }
}
