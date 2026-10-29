import { createHash } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { createClient } from "@sanity/client"
import sharp from "sharp"

const client = createClient({ projectId: "zlh03v8i", dataset: "production", apiVersion: "2024-01-01", useCdn: false })
// Keep publication eligibility aligned with src/lib/artwork-publication.ts.
const artworks = await client.fetch(`*[_type == "artwork" && (
  !defined(collectionType) || collectionType != "new_collection" ||
  (rightsStatus == "approved" && migrationStatus == "ready")
)]{productMedia}`)
const urls = [...new Set(artworks.flatMap(({ productMedia = [] }) => (productMedia || [])
  .filter((media) => media.mediaType === "video" && media.approvedForStorefront === true && media.posterUrl)
  .map((media) => media.posterUrl)))].sort()
await mkdir("public/images/video-thumbnails", { recursive: true })
const manifest = {}
let originalBytes = 0
let thumbnailBytes = 0
for (const source of urls) {
  const url = new URL(source)
  if (url.protocol !== "https:" || url.hostname !== "assets.yiiart.com") throw new Error("Unexpected poster origin")
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Poster download failed: ${response.status}`)
  const input = Buffer.from(await response.arrayBuffer())
  const output = await sharp(input).rotate().resize({ width: 192, height: 192, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
  const name = `${createHash("sha256").update(source).update(output).digest("hex").slice(0, 24)}.webp`
  await writeFile(`public/images/video-thumbnails/${name}`, output)
  manifest[source] = `/images/video-thumbnails/${name}`
  originalBytes += input.length
  thumbnailBytes += output.length
}
await writeFile("src/lib/video-poster-thumbnails.json", `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ posters: urls.length, originalBytes, thumbnailBytes }))
