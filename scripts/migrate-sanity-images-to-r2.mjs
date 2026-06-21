import fs from "fs"
import path from "path"
import { createHash } from "crypto"
import { createClient } from "@sanity/client"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

loadEnvFile(".env.local")

const args = new Set(process.argv.slice(2))
const dryRun = args.has("--dry-run")
const force = args.has("--force")
const concurrency = clampNumber(process.env.R2_MIGRATION_CONCURRENCY || 4, 1, 8)
const retryCount = clampNumber(process.env.R2_MIGRATION_RETRIES || 3, 1, 6)
const config = await getR2Config()
const sanityWriteToken = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: dryRun ? undefined : sanityWriteToken,
})
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  forcePathStyle: true,
})

if (!dryRun && !sanityWriteToken) {
  throw new Error("Missing SANITY_WRITE_TOKEN or SANITY_API_WRITE_TOKEN.")
}

await migrateArtworks()
await migrateReviews()

async function migrateArtworks() {
  const artworks = await sanity.fetch(`*[_type == "artwork" && defined(images[0])]{
    _id,
    title,
    cloudflareImages,
    images[]{
      _key,
      asset->{_id, url, originalFilename, mimeType}
    }
  }`)
  const pending = artworks.filter((artwork) => force || !artwork.cloudflareImages?.some((image) => image?.url))
  const results = await runWithConcurrency(pending, concurrency, migrateArtwork)
  const migrated = results.filter(Boolean).length

  console.log(`${dryRun ? "Checked" : "Migrated"} ${migrated} artwork documents.`)
}

async function migrateArtwork(artwork) {
  const images = []
  for (const [index, image] of (artwork.images || []).entries()) {
    const asset = image.asset
    if (!asset?.url) continue
    const key = `migrated/artworks/${artwork._id}/${index + 1}-${cleanFilename(asset.originalFilename || asset._id || "artwork")}`
    const uploaded = dryRun
      ? { key, contentType: asset.mimeType || "application/octet-stream" }
      : await withRetries(
          () =>
            copySanityAssetToR2({
              sourceUrl: asset.url,
              key,
              contentType: asset.mimeType,
            }),
          `upload artwork ${artwork._id}`
        )
    images.push({
      _type: "cloudflareAsset",
      _key: sanityKey(uploaded.key),
      key: uploaded.key,
      url: publicUrlFor(uploaded.key),
      alt: pickLocalizedText(artwork.title, "YiiArt artwork"),
      contentType: uploaded.contentType,
    })
  }

  if (images.length === 0) return false

  if (dryRun) {
    console.log(`[dry-run] artwork ${artwork._id}: ${images.length} images`)
  } else {
    await withRetries(
      () => sanity.patch(artwork._id).set({ cloudflareImages: images }).commit(),
      `patch artwork ${artwork._id}`
    )
    console.log(`migrated artwork ${artwork._id}: ${images.length} images`)
  }

  return true
}

async function migrateReviews() {
  const reviews = await sanity.fetch(`*[_type == "review" && defined(photos[0])]{
    _id,
    reviewTitle,
    cloudflarePhotos,
    photos[]{
      _key,
      alt,
      asset->{_id, url, originalFilename, mimeType}
    }
  }`)
  const pending = reviews.filter((review) => force || !review.cloudflarePhotos?.some((photo) => photo?.url))
  const results = await runWithConcurrency(pending, concurrency, migrateReview)
  const migrated = results.filter(Boolean).length

  console.log(`${dryRun ? "Checked" : "Migrated"} ${migrated} review documents.`)
}

async function migrateReview(review) {
  const photos = []
  for (const [index, photo] of (review.photos || []).entries()) {
    const asset = photo.asset
    if (!asset?.url) continue
    const key = `migrated/reviews/${review._id}/${index + 1}-${cleanFilename(asset.originalFilename || asset._id || "review")}`
    const uploaded = dryRun
      ? { key, contentType: asset.mimeType || "application/octet-stream" }
      : await withRetries(
          () =>
            copySanityAssetToR2({
              sourceUrl: asset.url,
              key,
              contentType: asset.mimeType,
            }),
          `upload review ${review._id}`
        )
    photos.push({
      _type: "cloudflareAsset",
      _key: sanityKey(uploaded.key),
      key: uploaded.key,
      url: publicUrlFor(uploaded.key),
      alt: photo.alt || review.reviewTitle || "YiiArt collector photo",
      contentType: uploaded.contentType,
    })
  }

  if (photos.length === 0) return false

  if (dryRun) {
    console.log(`[dry-run] review ${review._id}: ${photos.length} photos`)
  } else {
    await withRetries(
      () => sanity.patch(review._id).set({ cloudflarePhotos: photos }).commit(),
      `patch review ${review._id}`
    )
    console.log(`migrated review ${review._id}: ${photos.length} photos`)
  }

  return true
}

async function copySanityAssetToR2({ sourceUrl, key, contentType }) {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch Sanity asset ${sourceUrl}: ${response.status}`)
  }
  const body = Buffer.from(await response.arrayBuffer())
  const resolvedContentType = contentType || response.headers.get("content-type") || "application/octet-stream"

  if (!dryRun) {
    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: resolvedContentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    )
  }

  return { key, contentType: resolvedContentType }
}

async function getR2Config() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || "yiiart-assets"
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
  let accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  let secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if ((!accessKeyId || !secretAccessKey) && process.env.CLOUDFLARE_R2_API_TOKEN) {
    const response = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_R2_API_TOKEN}` },
    })
    const verification = await response.json()
    if (!verification.success || !verification.result?.id) {
      throw new Error("Cloudflare API token verification failed.")
    }
    accessKeyId = verification.result.id
    secretAccessKey = createHash("sha256").update(process.env.CLOUDFLARE_R2_API_TOKEN).digest("hex")
  }

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !publicUrl) {
    throw new Error("Missing Cloudflare R2 environment variables.")
  }

  return {
    accountId,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicUrl: publicUrl.replace(/\/+$/, ""),
  }
}

function publicUrlFor(key) {
  return `${config.publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`
}

function pickLocalizedText(value, fallback) {
  if (!value) return fallback
  if (typeof value === "string") return value
  return value.en || value.zh || fallback
}

function sanityKey(value) {
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(-12) || Date.now().toString(36)
}

function cleanFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0

  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      try {
        results[index] = await worker(items[index])
      } catch (error) {
        console.error(`failed ${items[index]?._id || index}: ${formatError(error)}`)
        results[index] = false
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker))
  return results
}

function clampNumber(value, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.max(min, Math.min(Math.floor(number), max))
}

async function withRetries(operation, label) {
  let lastError

  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      console.error(`${label} attempt ${attempt}/${retryCount} failed: ${formatError(error)}`)
      if (attempt < retryCount) {
        await wait(1000 * attempt)
      }
    }
  }

  throw lastError
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatError(error) {
  const code = error?.code || error?.statusCode || error?.response?.statusCode
  const message = error?.message || String(error)
  return [code, message].filter(Boolean).join(" ")
}

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  const lines = fs.readFileSync(path.join(process.cwd(), file), "utf8").split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^["']|["']$/g, "")
  }
}
