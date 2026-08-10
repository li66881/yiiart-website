export type MediaAuditFile = {
  name: string
  mediaType: "image" | "video"
  role: string
  sha256: string
  width: number | null
  height: number | null
}

export type MediaAuditFolder = {
  sourceFolder: string
  readyForUpload: boolean
  suggestedMatch: {
    artworkId: string
    slug: string
    title: string
  } | null
  files: MediaAuditFile[]
}

export type ProductMediaReviewDecision = {
  status: string
  artworkId?: string
  slug?: string
  correctedCatalogCode?: string
  correctedPhysicalSize?: {
    widthCm: number
    heightCm: number
  }
  notes?: string
}

export type ProductMediaReviewConfig = {
  autoApproveReadyFolders: boolean
  decisions: Record<string, ProductMediaReviewDecision>
}

export type ApprovedProductMediaImport = {
  status: "approved"
  approval: string
  sourceFolder: string
  artworkId: string
  slug: string
  title: string
  catalogCode: string
  correctedPhysicalSize: {
    widthCm: number
    heightCm: number
  } | null
  notes: string
  files: MediaAuditFile[]
}

export type ProductMediaImportResolution =
  | ApprovedProductMediaImport
  | {
    status: "excluded" | "hold"
    sourceFolder: string
    reason: string
  }

export type ProductMediaImportEntry = {
  _key: string
  _type: "productMedia"
  mediaType: "image" | "video"
  role: string
  sourceName: string
  r2Key: string
  url: string
  contentType: string
  alt: string
  width: number | null
  height: number | null
  order: number
  sourceFolder: string
  sourceNote: string
  approvedForStorefront: true
}

export function resolveProductMediaImport(
  folder: MediaAuditFolder,
  config: ProductMediaReviewConfig,
): ProductMediaImportResolution {
  const decision = config.decisions[folder.sourceFolder]

  if (decision?.status === "excluded") {
    return {
      status: "excluded",
      sourceFolder: folder.sourceFolder,
      reason: decision.notes || "Explicitly excluded during media review.",
    }
  }

  if (decision?.status.startsWith("approved")) {
    if (!decision.artworkId || !decision.slug) {
      throw new Error(`Approved media decision is missing an artwork ID or slug: ${folder.sourceFolder}`)
    }

    return {
      status: "approved",
      approval: decision.status,
      sourceFolder: folder.sourceFolder,
      artworkId: decision.artworkId,
      slug: decision.slug,
      title: folder.suggestedMatch?.slug === decision.slug
        ? folder.suggestedMatch.title
        : titleFromSlug(decision.slug),
      catalogCode: decision.correctedCatalogCode || folder.sourceFolder,
      correctedPhysicalSize: decision.correctedPhysicalSize || null,
      notes: decision.notes || "",
      files: folder.files,
    }
  }

  if (config.autoApproveReadyFolders && folder.readyForUpload && folder.suggestedMatch) {
    return {
      status: "approved",
      approval: "approved_by_audit",
      sourceFolder: folder.sourceFolder,
      artworkId: folder.suggestedMatch.artworkId,
      slug: folder.suggestedMatch.slug,
      title: folder.suggestedMatch.title,
      catalogCode: folder.sourceFolder,
      correctedPhysicalSize: null,
      notes: "Unique high-confidence match that passed the automated completeness gate.",
      files: folder.files,
    }
  }

  return {
    status: "hold",
    sourceFolder: folder.sourceFolder,
    reason: "Folder is not explicitly approved and did not pass the automated upload gate.",
  }
}

export function buildProductMediaEntries(
  resolved: ApprovedProductMediaImport,
  options: {
    publicBaseUrl: string
    objectPrefix?: string
  },
): ProductMediaImportEntry[] {
  const baseUrl = options.publicBaseUrl.replace(/\/+$/, "")
  const objectPrefix = (options.objectPrefix || "products").replace(/^\/+|\/+$/g, "")
  const duplicateCounts = new Map<string, number>()

  return [...resolved.files]
    .sort(compareMediaFiles)
    .map((file, order) => {
      const duplicateIndex = duplicateCounts.get(file.role) || 0
      duplicateCounts.set(file.role, duplicateIndex + 1)
      const normalizedRole = normalizePathPart(file.role || "other")
      const hash = file.sha256.slice(0, 12).toLowerCase()
      const extension = file.mediaType === "video" ? normalizedVideoExtension(file.name) : "webp"
      const filename = `${String(order).padStart(2, "0")}-${normalizedRole}-${hash}.${extension}`
      const r2Key = [objectPrefix, normalizePathPart(resolved.slug), normalizePathPart(resolved.sourceFolder), filename]
        .filter(Boolean)
        .join("/")
      const roleLabel = roleLabels[file.role] || "additional view"
      const duplicateLabel = duplicateIndex > 0 ? `additional ${roleLabel}` : roleLabel

      return {
        _key: `${normalizedRole}_${hash}`,
        _type: "productMedia",
        mediaType: file.mediaType,
        role: file.role || "other",
        sourceName: file.name,
        r2Key,
        url: `${baseUrl}/${r2Key}`,
        contentType: file.mediaType === "video" ? videoContentType(extension) : "image/webp",
        alt: `${resolved.title} handmade painting, ${duplicateLabel}`,
        width: file.width,
        height: file.height,
        order,
        sourceFolder: resolved.sourceFolder,
        sourceNote: resolved.notes || "Owned YiiArt product media approved through the audited import workflow.",
        approvedForStorefront: true,
      }
    })
}

const roleOrder: Record<string, number> = {
  front: 0,
  original: 1,
  detail: 2,
  process: 3,
  living_room: 4,
  angle: 5,
  bedroom: 6,
  dining_room: 7,
  scale: 7,
  other: 8,
}

const roleLabels: Record<string, string> = {
  front: "front view",
  original: "original artwork view",
  detail: "texture detail",
  process: "studio process",
  living_room: "living room view",
  angle: "angle view",
  bedroom: "bedroom view",
  dining_room: "dining room view",
  scale: "scale view",
  other: "additional view",
}

function compareMediaFiles(left: MediaAuditFile, right: MediaAuditFile) {
  const roleDifference = (roleOrder[left.role] ?? 99) - (roleOrder[right.role] ?? 99)
  if (roleDifference) return roleDifference

  const variantDifference = Number(/\.\./.test(left.name)) - Number(/\.\./.test(right.name))
  return variantDifference || left.name.localeCompare(right.name, "en", { numeric: true })
}

function normalizedVideoExtension(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase()
  return extension === "webm" ? "webm" : "mp4"
}

function videoContentType(extension: string) {
  return extension === "webm" ? "video/webm" : "video/mp4"
}

function normalizePathPart(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
