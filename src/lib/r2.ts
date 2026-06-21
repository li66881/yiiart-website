import crypto from "crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

type UploadR2ObjectInput = {
  namespace: string
  filename: string
  body: Buffer
  contentType?: string
  cacheControl?: string
}

type R2Config = {
  accountId: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string
  prefix: string
}

let client: S3Client | null = null

export function isR2Configured() {
  return Boolean(getR2Config())
}

export async function uploadR2Object(input: UploadR2ObjectInput) {
  const config = getR2Config()

  if (!config) {
    throw new Error("Cloudflare R2 is not configured.")
  }

  const key = createR2ObjectKey(config.prefix, input.namespace, input.filename)
  const contentType = input.contentType || "application/octet-stream"

  await getR2Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: input.body,
      ContentType: contentType,
      CacheControl: input.cacheControl || "public, max-age=31536000, immutable",
    })
  )

  return {
    key,
    url: getR2PublicUrl(key, config.publicUrl),
    contentType,
  }
}

export function getR2PublicUrl(key: string, publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || "") {
  const base = publicUrl.replace(/\/+$/, "")
  const cleanKey = key.replace(/^\/+/, "")

  if (!base || !cleanKey) return ""

  return `${base}/${cleanKey.split("/").map(encodeURIComponent).join("/")}`
}

function getR2Client(config: R2Config) {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    })
  }

  return client
}

function getR2Config(): R2Config | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
  const prefix = process.env.CLOUDFLARE_R2_PREFIX || "uploads"

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !publicUrl) {
    return null
  }

  return {
    accountId,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicUrl,
    prefix: prefix.replace(/^\/+|\/+$/g, ""),
  }
}

function createR2ObjectKey(prefix: string, namespace: string, filename: string) {
  const date = new Date()
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const id = crypto.randomUUID()
  const extension = cleanExtension(filename)
  const safeNamespace = cleanPathSegment(namespace) || "files"
  const parts = [prefix, safeNamespace, String(year), month, `${id}${extension}`].filter(Boolean)

  return parts.join("/")
}

function cleanExtension(filename: string) {
  const match = filename.toLowerCase().match(/\.[a-z0-9]{1,12}$/)
  return match ? match[0] : ""
}

function cleanPathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
