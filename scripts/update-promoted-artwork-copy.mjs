import fs from "node:fs"
import path from "node:path"
import { createClient } from "@sanity/client"

const COPY_PATH = process.env.YIIART_COPY_JSON
  || "E:/谷歌云盘/网站社交媒体运营/社媒运营codex发布/content/copy/2026-09-12-five-artworks-website-update.json"
const BACKUP_DIR = process.env.YIIART_COPY_BACKUP_DIR
  || "E:/谷歌云盘/网站社交媒体运营/社媒运营codex发布/operations/backups"
const apply = process.argv.includes("--apply")
const extraSlug = "electric-pink-meadow"

const colorMap = {
  "quiet-geometry-01": ["Green", "White", "Black", "Neutral"],
  "gilded-shore-01": ["Neutral", "Blue", "Gray", "Earth tone", "Yellow"],
  "white-peony-relief": ["White", "Pink", "Neutral", "Earth tone"],
  "walled-garden": ["Green", "Neutral", "Yellow", "Pink", "Blue", "Black"],
  "pastel-meadow": ["Pink", "Yellow", "Orange", "Green", "White", "Multicolor"],
}

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
  timeout: 120000,
})

const input = JSON.parse(fs.readFileSync(COPY_PATH, "utf8"))
const slugs = [...input.products.map((product) => product.slug), extraSlug]
const docs = await client.fetch(
  `*[_type == "artwork" && slug.current in $slugs]{
    _id, _rev, _updatedAt, slug, title, shortDescription, description, artworkStory,
    styleTags, colorFamilies, roomTypes, seoKeywords, price, dimensions, widthCm, heightCm,
    images, cloudflareImages, productMedia, artist, availability, allowCheckout, productionModel
  }`,
  { slugs },
)

const published = docs.filter((doc) => !String(doc._id).startsWith("drafts."))
fs.mkdirSync(BACKUP_DIR, { recursive: true })
const backupPath = path.join(BACKUP_DIR, `artworks-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`)
fs.writeFileSync(backupPath, `${JSON.stringify(published, null, 2)}\n`)

const patches = input.products.map((product) => {
  const doc = published.find((item) => item.slug?.current === product.slug)
  if (!doc) throw new Error(`Missing published artwork: ${product.slug}`)
  return {
    id: doc._id,
    revision: doc._rev,
    slug: product.slug,
    set: {
      "shortDescription.en": product.shortDescription,
      "description.en": product.description,
      "artworkStory.en": product.description,
      styleTags: product.styles,
      colorFamilies: colorMap[product.slug],
      roomTypes: product.rooms,
      seoKeywords: [product.primarySearchTheme, ...product.relatedSearchPhrases],
    },
  }
})

const pinkDoc = published.find((item) => item.slug?.current === extraSlug)
if (!pinkDoc) throw new Error("Missing published artwork: electric-pink-meadow")
const pinkColors = Array.from(new Set([...(pinkDoc.colorFamilies || []), "Pink"]))
patches.push({
  id: pinkDoc._id,
  revision: pinkDoc._rev,
  slug: extraSlug,
  set: { colorFamilies: pinkColors },
})

const summary = {
  tokenAvailable: Boolean(token),
  backupPath,
  products: patches.map((patch) => ({
    slug: patch.slug,
    currentTitle: published.find((doc) => doc._id === patch.id)?.title?.en,
    colors: patch.set.colorFamilies,
  })),
}

if (!apply) {
  console.log(JSON.stringify({ ...summary, status: "preflight" }, null, 2))
  process.exit(0)
}

if (!token) {
  console.error(JSON.stringify({ ...summary, status: "blocked", reason: "missing_sanity_write_token" }, null, 2))
  process.exit(2)
}

let transaction = client.transaction()
for (const patch of patches) {
  transaction = transaction.patch(patch.id, (next) => next.ifRevisionId(patch.revision).set(patch.set))
}
await transaction.commit()

const after = await client.fetch(
  `*[_type == "artwork" && slug.current in $slugs]{ _id, slug, shortDescription, description, artworkStory, styleTags, colorFamilies, roomTypes, seoKeywords, title, price }`,
  { slugs },
)
for (const patch of patches) {
  const doc = after.find((item) => item._id === patch.id)
  for (const [key, value] of Object.entries(patch.set)) {
    const actual = key.split(".").reduce((object, part) => object?.[part], doc)
    if (JSON.stringify(actual) !== JSON.stringify(value)) {
      throw new Error(`Verification failed: ${patch.slug} ${key}`)
    }
  }
}

console.log(JSON.stringify({ ...summary, status: "sanity_updated_verified" }, null, 2))
