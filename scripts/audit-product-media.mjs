import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { createClient } from "@sanity/client"

loadEnvFile(".env.local")

const args = parseArgs(process.argv.slice(2))
const sourceDirectory = path.resolve(args.source || process.env.YIIART_MEDIA_SOURCE || "")
const outputBase = path.resolve(args.output || "reports/product-media-audit")

if (!args.source && !process.env.YIIART_MEDIA_SOURCE) {
  throw new Error('Provide --source="C:\\path\\to\\media" or set YIIART_MEDIA_SOURCE.')
}

if (!fs.existsSync(sourceDirectory) || !fs.statSync(sourceDirectory).isDirectory()) {
  throw new Error(`Media source directory was not found: ${sourceDirectory}`)
}

const productFolders = scanProductFolders(sourceDirectory)
const artworks = args.offline ? [] : await fetchArtworks().catch((error) => {
  console.warn(`Sanity lookup was unavailable: ${error.message}`)
  return []
})
const audits = productFolders.map((folder) => auditFolder(folder, artworks))
const summary = buildSummary(audits, artworks.length)

fs.mkdirSync(path.dirname(outputBase), { recursive: true })
fs.writeFileSync(`${outputBase}.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, folders: audits }, null, 2)}\n`)
fs.writeFileSync(`${outputBase}.csv`, toCsv(audits))

console.log(`Audited ${summary.folderCount} media folders and ${summary.fileCount} files.`)
console.log(`Complete folders: ${summary.completeFolderCount}`)
console.log(`High-confidence matches: ${summary.highConfidenceMatches}`)
console.log(`Ready for reviewed upload: ${summary.readyForUpload}`)
console.log(`Needs review: ${summary.needsReview}`)
console.log(`Unmatched: ${summary.unmatched}`)
console.log(`JSON: ${outputBase}.json`)
console.log(`CSV: ${outputBase}.csv`)

function scanProductFolders(source) {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
    .map((entry) => {
      const folderPath = path.join(source, entry.name)
      const files = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter((file) => file.isFile() && /\.(jpe?g|png|webp|mp4|webm)$/i.test(file.name))
        .map((file) => inspectFile(folderPath, file.name))

      return {
        code: entry.name,
        physicalSize: parseFolderSize(entry.name),
        files,
      }
    })
}

function inspectFile(folderPath, name) {
  const filePath = path.join(folderPath, name)
  const buffer = fs.readFileSync(filePath)
  const mediaType = /\.(mp4|webm)$/i.test(name) ? "video" : "image"
  const dimensions = mediaType === "image" ? readImageDimensions(buffer) : null

  return {
    name,
    mediaType,
    role: classifyRole(name, mediaType),
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    width: dimensions?.width || null,
    height: dimensions?.height || null,
  }
}

function auditFolder(folder, artworks) {
  const expectedRoles = ["original", "front", "detail", "living_room", "angle", "bedroom"]
  const presentRoles = folder.files.map((file) => file.role)
  const missingRoles = expectedRoles.filter((role) => !presentRoles.includes(role))
  const duplicateRoles = expectedRoles.flatMap((role) => {
    const files = folder.files.filter((file) => file.role === role)
    return files.length > 1 ? [{ role, count: files.length, exactDuplicate: new Set(files.map((file) => file.sha256)).size < files.length }] : []
  })
  const original = folder.files.find((file) => file.role === "original") || null
  const candidates = artworks
    .map((artwork) => scoreCandidate(folder, original, artwork))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 5)
  const top = candidates[0]
  const runnerUp = candidates[1]
  const confidence = !top
    ? "unmatched"
    : top.score >= 90 && (!runnerUp || top.score - runnerUp.score >= 10)
      ? "high"
      : "review"

  return {
    sourceFolder: folder.code,
    physicalSize: folder.physicalSize,
    suspiciousFolderSize: Boolean(folder.physicalSize && Math.max(folder.physicalSize.widthCm, folder.physicalSize.heightCm) > 320),
    fileCount: folder.files.length,
    complete: missingRoles.length === 0 && duplicateRoles.length === 0,
    missingRoles,
    duplicateRoles,
    files: folder.files,
    originalPixelSize: original ? { width: original.width, height: original.height } : null,
    matchConfidence: confidence,
    readyForUpload: confidence === "high"
      && missingRoles.length === 0
      && duplicateRoles.length === 0
      && !Boolean(folder.physicalSize && Math.max(folder.physicalSize.widthCm, folder.physicalSize.heightCm) > 320),
    suggestedMatch: confidence === "high" ? top : null,
    candidates,
  }
}

function scoreCandidate(folder, original, artwork) {
  let score = 0
  const reasons = []
  const folderCode = normalizeCode(folder.code)
  const catalogCode = normalizeCode(artwork.catalogCode)

  if (catalogCode && catalogCode === folderCode) {
    score += 120
    reasons.push("catalog code")
  }

  if (normalizeCode(artwork.slug) === folderCode) {
    score += 100
    reasons.push("slug")
  }

  if (original?.width && original?.height) {
    if (samePair(original, artwork.sanityImageDimensions)) {
      score += 100
      reasons.push("Sanity main image pixels")
    }

    const legacyPair = parseNumberPair(artwork.dimensions)
    if (legacyPair && Math.max(legacyPair.width, legacyPair.height) > 320 && samePair(original, legacyPair)) {
      score += 95
      reasons.push("legacy dimensions match original pixels")
    }
  }

  if (folder.physicalSize) {
    const realPair = positivePair(artwork.widthCm, artwork.heightCm)
    if (samePair(folder.physicalSize, realPair)) {
      score += 70
      reasons.push("real artwork size")
    } else {
      const listedPair = parseNumberPair(artwork.dimensions)
      if (listedPair && Math.max(listedPair.width, listedPair.height) <= 320 && samePair(folder.physicalSize, listedPair)) {
        score += 60
        reasons.push("listed artwork size")
      }
    }
  }

  return {
    artworkId: artwork._id,
    slug: artwork.slug,
    title: localizedTitle(artwork.title),
    score,
    reasons,
  }
}

async function fetchArtworks() {
  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    timeout: Number(process.env.SANITY_REQUEST_TIMEOUT_MS || "20000"),
  })

  return sanity.fetch(`*[_type == "artwork"]{
    _id,
    title,
    "slug": slug.current,
    catalogCode,
    dimensions,
    widthCm,
    heightCm,
    "sanityImageDimensions": images[0].asset->metadata.dimensions
  }`)
}

function classifyRole(name, mediaType) {
  if (mediaType === "video") return "process"
  if (/^00-original/i.test(name)) return "original"
  if (/^01-white-bg-front/i.test(name)) return "front"
  if (/^02-detail-texture/i.test(name)) return "detail"
  if (/^03-scene-livingroom/i.test(name)) return "living_room"
  if (/^04-scene-angle/i.test(name)) return "angle"
  if (/^05-scene-bedroom/i.test(name)) return "bedroom"
  return "other"
}

function parseFolderSize(value) {
  const match = String(value || "").match(/^(\d+)-(\d+)(?:-|$)/)
  if (!match) return null
  return { widthCm: Number(match[1]), heightCm: Number(match[2]) }
}

function parseNumberPair(value) {
  const numbers = String(value || "").match(/\d+(?:\.\d+)?/g)?.map(Number)
  return numbers && numbers.length >= 2 ? { width: numbers[0], height: numbers[1] } : null
}

function positivePair(width, height) {
  const resolvedWidth = Number(width)
  const resolvedHeight = Number(height)
  return Number.isFinite(resolvedWidth) && resolvedWidth > 0 && Number.isFinite(resolvedHeight) && resolvedHeight > 0
    ? { width: resolvedWidth, height: resolvedHeight }
    : null
}

function samePair(left, right) {
  if (!left || !right) return false
  const leftWidth = Number(left.width ?? left.widthCm)
  const leftHeight = Number(left.height ?? left.heightCm)
  const rightWidth = Number(right.width ?? right.widthCm)
  const rightHeight = Number(right.height ?? right.heightCm)
  return (leftWidth === rightWidth && leftHeight === rightHeight)
    || (leftWidth === rightHeight && leftHeight === rightWidth)
}

function readImageDimensions(buffer) {
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2
    const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])

    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1
        continue
      }

      const marker = buffer[offset + 1]
      if (startOfFrameMarkers.has(marker)) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) }
      }

      if (marker === 0xd9 || marker === 0xda) break
      const segmentLength = buffer.readUInt16BE(offset + 2)
      if (segmentLength < 2) break
      offset += segmentLength + 2
    }
  }

  return null
}

function buildSummary(audits, artworkCount) {
  return {
    folderCount: audits.length,
    fileCount: audits.reduce((total, folder) => total + folder.fileCount, 0),
    completeFolderCount: audits.filter((folder) => folder.complete).length,
    suspiciousFolderCount: audits.filter((folder) => folder.suspiciousFolderSize).length,
    highConfidenceMatches: audits.filter((folder) => folder.matchConfidence === "high").length,
    readyForUpload: audits.filter((folder) => folder.readyForUpload).length,
    needsReview: audits.filter((folder) => folder.matchConfidence === "review").length,
    unmatched: audits.filter((folder) => folder.matchConfidence === "unmatched").length,
    sanityArtworkCount: artworkCount,
  }
}

function toCsv(audits) {
  const headers = [
    "sourceFolder",
    "physicalSize",
    "fileCount",
    "complete",
    "missingRoles",
    "duplicateRoles",
    "originalPixels",
    "matchConfidence",
    "readyForUpload",
    "suggestedArtworkId",
    "suggestedSlug",
    "suggestedTitle",
    "matchReasons",
    "candidateSlugs",
    "reviewStatus",
    "confirmedArtworkId",
    "confirmedSlug",
    "reviewNotes",
  ]
  const rows = audits.map((audit) => {
    const match = audit.suggestedMatch
    return [
      audit.sourceFolder,
      audit.physicalSize ? `${audit.physicalSize.widthCm}x${audit.physicalSize.heightCm}cm` : "",
      audit.fileCount,
      audit.complete,
      audit.missingRoles.join(";"),
      audit.duplicateRoles.map((item) => `${item.role}x${item.count}${item.exactDuplicate ? " exact" : ""}`).join(";"),
      audit.originalPixelSize ? `${audit.originalPixelSize.width}x${audit.originalPixelSize.height}` : "",
      audit.matchConfidence,
      audit.readyForUpload,
      match?.artworkId || "",
      match?.slug || "",
      match?.title || "",
      match?.reasons.join(";") || "",
      audit.candidates.map((candidate) => `${candidate.slug || candidate.artworkId}:${candidate.score}`).join(";"),
      "",
      "",
      "",
      "",
    ]
  })

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n"
}

function csvCell(value) {
  const text = String(value ?? "")
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function localizedTitle(value) {
  if (typeof value === "string") return value
  return value?.en || value?.zh || "Untitled artwork"
}

function normalizeCode(value) {
  return String(value || "").trim().toLowerCase()
}

function parseArgs(values) {
  return values.reduce((result, value) => {
    if (value === "--offline") result.offline = true
    else if (value.startsWith("--source=")) result.source = value.slice("--source=".length)
    else if (value.startsWith("--output=")) result.output = value.slice("--output=".length)
    return result
  }, {})
}

function loadEnvFile(filename) {
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
