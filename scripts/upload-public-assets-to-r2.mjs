import fs from "fs"
import path from "path"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

loadEnvFile(".env.local")

const rootDir = process.cwd()
const publicDir = path.join(rootDir, "public")
const config = await getR2Config()
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  forcePathStyle: true,
})

const files = walk(publicDir).filter((file) => fs.statSync(file).isFile())

for (const file of files) {
  const key = path.relative(publicDir, file).replace(/\\/g, "/")
  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: fs.createReadStream(file),
      ContentType: contentTypeFor(file),
      CacheControl: "public, max-age=31536000, immutable",
    })
  )
  console.log(`uploaded ${key}`)
}

console.log(`Uploaded ${files.length} public assets to R2 bucket ${config.bucket}.`)

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  })
}

function contentTypeFor(file) {
  const extension = path.extname(file).toLowerCase()
  return (
    {
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".ico": "image/x-icon",
      ".pdf": "application/pdf",
    }[extension] || "application/octet-stream"
  )
}

async function getR2Config() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET || "yiiart-assets"
  let accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  let secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if ((!accessKeyId || !secretAccessKey) && process.env.CLOUDFLARE_R2_API_TOKEN) {
    const crypto = await import("crypto")
    const response = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_R2_API_TOKEN}` },
    })
    const verification = await response.json()
    if (!verification.success || !verification.result?.id) {
      throw new Error("Cloudflare API token verification failed.")
    }
    accessKeyId = verification.result.id
    secretAccessKey = crypto.createHash("sha256").update(process.env.CLOUDFLARE_R2_API_TOKEN).digest("hex")
  }

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 environment variables.")
  }

  return { accountId, bucket, accessKeyId, secretAccessKey }
}

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^["']|["']$/g, "")
  }
}
