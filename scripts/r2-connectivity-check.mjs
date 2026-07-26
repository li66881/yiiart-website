// Real R2 connectivity test — mirrors the production upload path used by
// /api/custom-request. Reads the same env vars the app reads, uploads a tiny
// object, fetches it back over the public URL, then deletes it to clean up.
//
// Usage (PowerShell):
//   Get-Content .env.r2.local | ForEach-Object { if ($_ -match '^\s*([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim()) } }
//   node scripts/r2-connectivity-check.mjs
//
// Usage (bash / git-bash):
//   set -a; . ./.env.r2.local; set +a; node scripts/r2-connectivity-check.mjs

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const bucket = process.env.CLOUDFLARE_R2_BUCKET
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL || "").replace(/\/+$/, "")
const prefix = process.env.CLOUDFLARE_R2_PREFIX || "uploads"

function mask(v) {
  if (!v) return "(missing)"
  if (v.length <= 6) return "***"
  return `${v.slice(0, 3)}…${v.slice(-3)} (len ${v.length})`
}

console.log("R2 config seen by the app:")
console.log("  CLOUDFLARE_R2_ACCOUNT_ID      :", mask(accountId))
console.log("  CLOUDFLARE_R2_BUCKET          :", bucket || "(missing)")
console.log("  CLOUDFLARE_R2_ACCESS_KEY_ID   :", mask(accessKeyId))
console.log("  CLOUDFLARE_R2_SECRET_ACCESS_KEY:", mask(secretAccessKey))
console.log("  CLOUDFLARE_R2_PUBLIC_URL      :", publicUrl || "(missing)")
console.log("  CLOUDFLARE_R2_PREFIX          :", prefix)
console.log("")

const missing = []
if (!accountId) missing.push("CLOUDFLARE_R2_ACCOUNT_ID")
if (!bucket) missing.push("CLOUDFLARE_R2_BUCKET")
if (!accessKeyId) missing.push("CLOUDFLARE_R2_ACCESS_KEY_ID")
if (!secretAccessKey) missing.push("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
if (!publicUrl) missing.push("CLOUDFLARE_R2_PUBLIC_URL")

if (missing.length > 0) {
  console.error("❌ Not fully configured. Missing:", missing.join(", "))
  process.exit(1)
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
})

// Deterministic key so a stray run cannot litter the bucket with unique files.
const key = `${prefix}/_connectivity-check/r2-test.txt`
const body = Buffer.from(`yiiart r2 connectivity check\n`)

async function run() {
  // 1. PUT
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: body, ContentType: "text/plain",
    }))
    console.log("✅ PUT   ok  — uploaded", key)
  } catch (e) {
    console.error("❌ PUT   failed —", e.name + ":", e.message)
    console.error("   → credentials or bucket name are likely wrong.")
    process.exit(2)
  }

  // 2. GET via S3 API (proves the object exists / creds can read)
  try {
    await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    console.log("✅ GET   ok  — object readable via S3 API")
  } catch (e) {
    console.error("⚠️  GET   failed —", e.name + ":", e.message)
  }

  // 3. Fetch via the PUBLIC URL (proves the custom domain / public access works,
  //    which is what the site actually serves photos from)
  const url = `${publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`
  try {
    const res = await fetch(url)
    if (res.ok) {
      console.log(`✅ PUBLIC ok — ${url} → HTTP ${res.status}`)
    } else {
      console.log(`⚠️  PUBLIC HTTP ${res.status} — upload works, but the public URL is not serving it.`)
      console.log(`   → check the R2 bucket's public access / custom domain binding for ${publicUrl}`)
    }
  } catch (e) {
    console.log("⚠️  PUBLIC fetch error —", e.message)
  }

  // 4. DELETE (clean up the test object)
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    console.log("✅ DELETE ok — test object removed")
  } catch (e) {
    console.error("⚠️  DELETE failed (harmless leftover at", key + ") —", e.message)
  }

  console.log("\nDone. If PUT + PUBLIC are both ✅, R2 is fully wired for custom-request photo uploads.")
}

run()
