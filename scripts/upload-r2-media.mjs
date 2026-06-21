import { createReadStream } from "node:fs"
import { readdir } from "node:fs/promises"
import path from "node:path"

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID
const apiToken = process.env.CLOUDFLARE_R2_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN
const bucketName = process.env.CLOUDFLARE_R2_BUCKET || process.env.R2_BUCKET_NAME || "yiiart-assets"
const publicDir = path.resolve("public")

if (!accountId || !apiToken || !bucketName) {
  throw new Error("Set Cloudflare R2 account, token, and bucket environment variables before uploading media.")
}

const contentTypes = new Map([
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".mp4", "video/mp4"],
  [".mov", "video/quicktime"],
  [".pdf", "application/pdf"],
])

const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects`

async function main() {
  const files = await collectFiles(publicDir)
  let uploaded = 0

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = contentTypes.get(ext)
    if (!contentType) continue

    const key = path.relative(publicDir, filePath).split(path.sep).join("/")
    const response = await fetch(`${endpoint}/${encodeURIComponent(key).replace(/%2F/g, "/")}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": contentType,
      },
      body: createReadStream(filePath),
      duplex: "half",
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to upload ${key}: ${response.status} ${text}`)
    }

    uploaded += 1
    console.log(`Uploaded ${key}`)
  }

  console.log(`Done. Uploaded ${uploaded} media file(s) to ${bucketName}.`)
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
