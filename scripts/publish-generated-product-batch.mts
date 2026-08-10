import fs from "node:fs"
import path from "node:path"
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createClient } from "@sanity/client"
import sharp from "sharp"
import {
  assertGeneratedPublishedProductMatchesPlan,
  buildGeneratedMediaFieldPatch,
  buildGeneratedProductPublicationPlan,
  resolveGeneratedPublishedMedia,
  resolveGeneratedR2ObjectAction,
  verifyGeneratedProductSourceFiles,
} from "../src/lib/generated-product-batch"

loadEnvFile(".env.local")

const args = parseArgs(process.argv.slice(2))
if (!args.manifest) {
  throw new Error('Provide --manifest="C:\\path\\to\\product-manifest.json".')
}

const manifestPath = path.resolve(args.manifest)
const sourceDirectory = path.resolve(args.source || path.dirname(manifestPath))
const planPath = path.resolve(args.plan || "reports/generated-product-batch-plan.json")
const resultPath = path.resolve(args.result || "reports/generated-product-batch-result.json")
const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
  || process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
  || "https://art-media.yiiart.com"
const objectPrefix = process.env.CLOUDFLARE_R2_PRODUCT_PREFIX
  ? `${process.env.CLOUDFLARE_R2_PRODUCT_PREFIX}/generated`
  : "products/generated"

const manifest = readJson<any>(manifestPath)
const publicationPlan = buildGeneratedProductPublicationPlan(manifest, { publicBaseUrl, objectPrefix })
const sourceVerification = await verifyGeneratedProductSourceFiles(publicationPlan, sourceDirectory)
const imageMetadata = await inspectSourceImages(publicationPlan, sourceDirectory)
const runtime = createSanityRuntime()
const preflight = await inspectSanityState(publicationPlan, runtime.sanity)
const dryRun = {
  generatedAt: new Date().toISOString(),
  applyRequested: args.apply,
  manifestPath,
  sourceDirectory,
  publicBaseUrl,
  sourceVerification,
  imageMetadata,
  preflight,
  ...publicationPlan,
}

writeJsonAtomic(planPath, dryRun)
printSummary(dryRun)

if (preflight.conflicts.length > 0) {
  throw new Error(`Sanity preflight found ${preflight.conflicts.length} conflict(s). No publication was attempted.`)
}

if (!args.apply) {
  console.log(`Dry run only. Review ${planPath}, then rerun with --apply to publish.`)
  process.exit(0)
}

const r2 = createR2Runtime()
const stagedProducts = []

for (const product of publicationPlan.products) {
  const existing = preflight.products.find((item) => item.documentId === product.document._id)
  if (existing?.state === "published") {
    const publishedMedia = resolveGeneratedPublishedMedia(existing.record.productMedia, product.media)
    for (const media of publishedMedia) {
      const existingObject = await inspectR2Object(r2, media.r2Key)
      if (resolveGeneratedR2ObjectAction(existingObject, media.sha256) !== "skip") {
        throw new Error(`${product.document.slug.current}: published R2 object is missing and will not be recreated automatically.`)
      }
      await verifyPublicAsset(media.url)
    }
    const normalizedRecord = existing.record.generatedBatchKey
      ? existing.record
      : { ...existing.record, generatedBatchKey: product.document.generatedBatchKey }
    assertGeneratedPublishedProductMatchesPlan(normalizedRecord, product)
    const mediaPatch = buildGeneratedMediaFieldPatch(existing.record.productMedia, product.media)
    await runtime.sanity.patch(product.document._id).set({
      ...mediaPatch,
      generatedBatchKey: product.document.generatedBatchKey,
    }).commit({ autoGenerateArrayKeys: true })
    stagedProducts.push({
      documentId: product.document._id,
      slug: product.document.slug.current,
      state: "already_published" as const,
      media: existing.record.productMedia,
    })
    console.log(`${product.document.slug.current}: already published; verified media order was normalized.`)
    continue
  }

  const draftId = `drafts.${product.document._id}`
  const draftDocument = {
    ...product.document,
    _id: draftId,
    rightsStatus: "needs_review",
    migrationStatus: "needs_images",
    allowCheckout: false,
    productMedia: [],
  }

  await runtime.sanity.createIfNotExists(draftDocument)
  const productMedia = []

  for (const media of product.media) {
    const sourcePath = path.join(sourceDirectory, product.sourceFolder, media.sourceName)
    const prepared = await prepareImage(sourcePath)
    const existingObject = await inspectR2Object(r2, media.r2Key)
    const action = resolveGeneratedR2ObjectAction(existingObject, media.sha256)
    if (action === "upload") {
      await r2.client.send(new PutObjectCommand({
        Bucket: r2.bucket,
        Key: media.r2Key,
        Body: prepared.body,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: {
          "yiiart-batch": publicationPlan.batchId,
          "yiiart-source-sha256": media.sha256.toLowerCase(),
        },
      }))
    }
    await verifyPublicAsset(media.url)
    productMedia.push({
      _key: media._key,
      _type: media._type,
      mediaType: media.mediaType,
      role: media.role,
      url: media.url,
      key: media.r2Key,
      contentType: media.contentType,
      alt: media.alt,
      width: prepared.width,
      height: prepared.height,
      sortOrder: media.sortOrder,
      sourceFolder: media.sourceFolder,
      sourceNote: media.sourceNote,
      approvedForStorefront: media.approvedForStorefront,
    })
  }

  await runtime.sanity.patch(draftId).set({ productMedia }).commit({ autoGenerateArrayKeys: true })
  stagedProducts.push({
    documentId: product.document._id,
    slug: product.document.slug.current,
    state: "staged" as const,
    media: productMedia,
  })
  console.log(`${product.document.slug.current}: staged ${productMedia.length} verified media files.`)
}

const stagedIds = stagedProducts
  .filter((product) => product.state === "staged")
  .map((product) => `drafts.${product.documentId}`)
const stagedDocuments = stagedIds.length > 0
  ? await runtime.sanity.fetch<Array<{ _id: string; productMedia?: unknown[] }>>(
    `*[_id in $ids]{_id, productMedia}`,
    { ids: stagedIds },
  )
  : []

for (const draftId of stagedIds) {
  const staged = stagedDocuments.find((document) => document._id === draftId)
  if (!staged || !Array.isArray(staged.productMedia) || staged.productMedia.length !== 6) {
    throw new Error(`Sanity draft staging verification failed for ${draftId}. Products remain unpublished.`)
  }
}

let transaction = runtime.sanity.transaction()
for (const staged of stagedProducts.filter((product) => product.state === "staged")) {
  const product = publicationPlan.products.find((item) => item.document._id === staged.documentId)!
  transaction = transaction
    .create({ ...product.document, productMedia: staged.media })
    .delete(`drafts.${product.document._id}`)
}
if (stagedProducts.some((product) => product.state === "staged")) {
  await transaction.commit({ autoGenerateArrayKeys: true })
}

const verification = await verifyPublishedProducts(publicationPlan, runtime.sanity)
const result = {
  publishedAt: new Date().toISOString(),
  batchId: publicationPlan.batchId,
  sourceVerification,
  products: verification,
}
writeJsonAtomic(resultPath, result)
updateManifestAfterPublication(manifestPath, manifest, result)

console.log(`Published ${verification.length} generated made-to-order products with ${sourceVerification.verifiedFiles} verified images.`)
console.log(`Result: ${resultPath}`)

function createSanityRuntime() {
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  if (!token) throw new Error("SANITY_WRITE_TOKEN is required for generated product preflight and publication.")

  return {
    sanity: createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    }),
  }
}

function createR2Runtime() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const missing = [
    ["CLOUDFLARE_R2_ACCOUNT_ID", accountId],
    ["CLOUDFLARE_R2_BUCKET", bucket],
    ["CLOUDFLARE_R2_ACCESS_KEY_ID", accessKeyId],
    ["CLOUDFLARE_R2_SECRET_ACCESS_KEY", secretAccessKey],
  ].filter(([, value]) => !value).map(([name]) => name)

  if (missing.length > 0) throw new Error(`R2 publication credentials are missing: ${missing.join(", ")}`)
  return {
    bucket: bucket as string,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    }),
  }
}

async function inspectSanityState(
  plan: typeof publicationPlan,
  sanity: ReturnType<typeof createClient>,
) {
  const slugs = plan.products.map((product) => product.document.slug.current)
  const ids = plan.products.flatMap((product) => [product.document._id, `drafts.${product.document._id}`])
  const catalogCodes = plan.products.map((product) => product.document.catalogCode)
  const records = await sanity.fetch<Array<Record<string, any>>>(
    `*[_type == "artwork" && (slug.current in $slugs || _id in $ids || catalogCode in $catalogCodes)]{
      ...,
      "slug": slug.current
    }`,
    { slugs, ids, catalogCodes },
  )
  const conflicts: string[] = []
  const products = plan.products.map((product) => {
    const documentId = product.document._id
    const draftId = `drafts.${documentId}`
    const related = records.filter((record) => (
      record.slug === product.document.slug.current
      || record._id === documentId
      || record._id === draftId
      || record.catalogCode === product.document.catalogCode
    ))
    const conflicting = related.filter((record) => (
      ![documentId, draftId].includes(record._id)
      || record.catalogCode !== product.document.catalogCode
      || record.slug !== product.document.slug.current
      || (
        record._id === draftId
        && record.generatedBatchKey !== product.document.generatedBatchKey
      )
      || (
        record._id === documentId
        && record.generatedBatchKey !== product.document.generatedBatchKey
        && product.manifestSanityDocumentId !== documentId
      )
    ))
    if (conflicting.length > 0) {
      conflicts.push(`${product.document.slug.current}: ${conflicting.map((record) => record._id).join(", ")}`)
    }
    const published = related.find((record) => record._id === documentId)
    const draft = related.find((record) => record._id === draftId)
    if (published && conflicting.length === 0) {
      try {
        const normalizedRecord = published.generatedBatchKey
          ? published
          : { ...published, generatedBatchKey: product.document.generatedBatchKey }
        assertGeneratedPublishedProductMatchesPlan(normalizedRecord, product)
      } catch (error) {
        conflicts.push(`${product.document.slug.current}: ${error instanceof Error ? error.message : "canonical product mismatch"}`)
      }
    }
    return {
      documentId,
      slug: product.document.slug.current,
      state: published ? "published" : draft ? "draft" : "new",
      record: published || draft || null,
      media: published?.productMedia || draft?.productMedia || [],
    }
  })

  return { recordsFound: records.length, conflicts, products }
}

async function inspectSourceImages(plan: typeof publicationPlan, sourceRoot: string) {
  const images = []
  for (const product of plan.products) {
    for (const media of product.media) {
      const sourcePath = path.join(sourceRoot, product.sourceFolder, media.sourceName)
      const metadata = await sharp(sourcePath).metadata()
      if (!metadata.width || !metadata.height || metadata.width < 1000 || metadata.height < 1000) {
        throw new Error(`Generated product source resolution is too small: ${product.sourceFolder}/${media.sourceName}`)
      }
      images.push({
        slug: product.document.slug.current,
        sourceName: media.sourceName,
        width: metadata.width,
        height: metadata.height,
        sha256: media.sha256,
      })
    }
  }
  return images
}

async function prepareImage(sourcePath: string) {
  const result = await sharp(sourcePath)
    .rotate()
    .resize({ width: 2200, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 86, effort: 5 })
    .toBuffer({ resolveWithObject: true })
  return { body: result.data, width: result.info.width, height: result.info.height }
}

async function inspectR2Object(r2: ReturnType<typeof createR2Runtime>, key: string) {
  try {
    const result = await r2.client.send(new HeadObjectCommand({ Bucket: r2.bucket, Key: key }))
    return { contentType: result.ContentType, metadata: result.Metadata }
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound" || error?.name === "NoSuchKey") {
      return null
    }
    throw error
  }
}

async function verifyPublicAsset(url: string) {
  let lastStatus = 0
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" })
    lastStatus = response.status
    if (response.ok) return
    await new Promise((resolve) => setTimeout(resolve, attempt * 750))
  }
  throw new Error(`Uploaded R2 asset is not publicly reachable (${lastStatus}): ${url}`)
}

async function verifyPublishedProducts(plan: typeof publicationPlan, sanity: ReturnType<typeof createClient>) {
  const ids = plan.products.map((product) => product.document._id)
  const records = await sanity.fetch<Array<Record<string, any>>>(
    `*[_id in $ids]{
      ...,
      "slug": slug.current
    }`,
    { ids },
  )

  return plan.products.map((product) => {
    const record = records.find((item) => item._id === product.document._id)
    if (!record) throw new Error(`Published Sanity verification failed for ${product.document.slug.current}.`)
    assertGeneratedPublishedProductMatchesPlan(record, product)
    return {
      id: record._id,
      slug: record.slug,
      productUrl: `https://www.yiiart.com/artwork/${record.slug}`,
      mediaCount: record.productMedia.length,
      sizeCount: record.standardSizes.length,
      allowCheckout: record.allowCheckout,
      shippingProfile: record.shippingProfile,
    }
  })
}

function updateManifestAfterPublication(manifestFile: string, sourceManifest: any, result: any) {
  const idsBySlug = new Map(result.products.map((product: any) => [product.slug, product.id]))
  const nextManifest = {
    ...sourceManifest,
    reviewState: "published",
    publicationState: {
      status: "published",
      publishedAt: result.publishedAt,
      resultPath,
    },
    products: sourceManifest.products.map((product: any) => ({
      ...product,
      sanityDocumentId: idsBySlug.get(product.slug) || product.sanityDocumentId,
      status: idsBySlug.has(product.slug) ? "published" : product.status,
    })),
  }
  writeJsonAtomic(manifestFile, nextManifest)
}

function printSummary(plan: typeof dryRun) {
  console.log(`Products: ${plan.summary.products}`)
  console.log(`Media files: ${plan.summary.media}`)
  console.log(`Verified source hashes: ${plan.sourceVerification.verifiedFiles}`)
  console.log(`Sanity records found: ${plan.preflight.recordsFound}`)
  console.log(`Sanity conflicts: ${plan.preflight.conflicts.length}`)
  console.log(`Plan: ${planPath}`)
}

type ParsedArgs = {
  apply: boolean
  manifest?: string
  source?: string
  plan?: string
  result?: string
}

function parseArgs(values: string[]) {
  return values.reduce<ParsedArgs>((result, value) => {
    if (value === "--apply") result.apply = true
    else if (value.startsWith("--manifest=")) result.manifest = value.slice("--manifest=".length)
    else if (value.startsWith("--source=")) result.source = value.slice("--source=".length)
    else if (value.startsWith("--plan=")) result.plan = value.slice("--plan=".length)
    else if (value.startsWith("--result=")) result.result = value.slice("--result=".length)
    else throw new Error(`Unknown argument: ${value}`)
    return result
  }, { apply: false })
}

function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) throw new Error(`Required JSON file was not found: ${filePath}`)
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T
}

function writeJsonAtomic(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.tmp-${process.pid}`
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temporaryPath, filePath)
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
