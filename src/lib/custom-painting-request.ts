export const CUSTOM_PAINTING_MAX_FILES = 5
export const CUSTOM_PAINTING_MAX_FILE_SIZE = 10 * 1024 * 1024
export const CUSTOM_PAINTING_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const CUSTOM_PAINTING_ROOM_TYPES = [
  "Living room",
  "Bedroom",
  "Dining room",
  "Office",
  "Entryway",
  "Hospitality space",
] as const
export const CUSTOM_PAINTING_BUDGETS = [
  "Under $500",
  "$500 - $1,000",
  "$1,000 - $2,000",
  "$2,000 - $5,000",
  "$5,000+",
] as const

export type UploadFileMetadata = {
  name: string
  type: string
  size: number
}

export type CustomPaintingAsset = {
  key: string
  url: string
  contentType: string
  size: number
  originalName: string
}

export type CustomPaintingRequest = {
  name: string
  email: string
  artworkSize: string
  preferredColors: string
  roomType: string
  budget: string
  message: string
  assets: CustomPaintingAsset[]
}

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

type AssetValidationOptions = {
  assetBaseUrl?: string
  r2Prefix?: string
}

const allowedTypes = new Set<string>(CUSTOM_PAINTING_ALLOWED_TYPES)
const allowedRoomTypes = new Set<string>(CUSTOM_PAINTING_ROOM_TYPES)
const allowedBudgets = new Set<string>(CUSTOM_PAINTING_BUDGETS)

export function validateUploadFiles(input: unknown): ValidationResult<UploadFileMetadata[]> {
  if (!Array.isArray(input)) {
    return invalid("Please choose valid image files.")
  }

  if (input.length > CUSTOM_PAINTING_MAX_FILES) {
    return invalid(`Please choose no more than ${CUSTOM_PAINTING_MAX_FILES} images.`)
  }

  const files: UploadFileMetadata[] = []

  for (const value of input) {
    if (!isRecord(value)) return invalid("Please choose valid image files.")

    const name = cleanString(value.name, 255)
    const type = cleanString(value.type, 100).toLowerCase()
    const size = Number(value.size)

    if (!name || !allowedTypes.has(type)) {
      return invalid("Images must be JPG, PNG, or WebP files.")
    }

    if (!Number.isInteger(size) || size <= 0 || size > CUSTOM_PAINTING_MAX_FILE_SIZE) {
      return invalid("Each image must be 10 MB or smaller.")
    }

    files.push({ name, type, size })
  }

  return { ok: true, value: files }
}

export function validateUploadedAssets(
  input: unknown,
  options: AssetValidationOptions = {}
): ValidationResult<CustomPaintingAsset[]> {
  if (!Array.isArray(input)) return invalid("Uploaded image details are not valid.")
  if (input.length > CUSTOM_PAINTING_MAX_FILES) {
    return invalid(`Please upload no more than ${CUSTOM_PAINTING_MAX_FILES} images.`)
  }

  const assetBaseUrl = (options.assetBaseUrl || "https://assets.yiiart.com").replace(/\/+$/, "")
  const r2Prefix = (options.r2Prefix || "uploads").replace(/^\/+|\/+$/g, "")
  const namespace = `${r2Prefix}/custom-requests/`
  const assets: CustomPaintingAsset[] = []

  for (const value of input) {
    if (!isRecord(value)) return invalid("Uploaded image details are not valid.")

    const asset = {
      key: cleanString(value.key, 500),
      url: cleanString(value.url, 1500),
      contentType: cleanString(value.contentType, 100).toLowerCase(),
      size: Number(value.size),
      originalName: cleanString(value.originalName, 255),
    }

    if (!asset.key.startsWith(namespace) || !allowedTypes.has(asset.contentType)) {
      return invalid("One or more uploaded images are not valid.")
    }

    if (!Number.isInteger(asset.size) || asset.size <= 0 || asset.size > CUSTOM_PAINTING_MAX_FILE_SIZE) {
      return invalid("One or more uploaded images are not valid.")
    }

    const expectedUrl = `${assetBaseUrl}/${asset.key.split("/").map(encodeURIComponent).join("/")}`
    if (asset.url !== expectedUrl) {
      return invalid("One or more uploaded images are not valid.")
    }

    assets.push(asset)
  }

  return { ok: true, value: assets }
}

export function validateCustomPaintingRequest(
  input: unknown,
  options: AssetValidationOptions = {}
): ValidationResult<CustomPaintingRequest> {
  if (!isRecord(input)) return invalid("Please complete the custom painting form.")
  if (cleanString(input.company, 200)) return invalid("Request could not be submitted.")

  const name = cleanString(input.name, 100)
  const email = cleanString(input.email, 254).toLowerCase()
  const artworkSize = cleanString(input.artworkSize, 120)
  const preferredColors = cleanString(input.preferredColors, 300)
  const roomType = cleanString(input.roomType, 100)
  const budget = cleanString(input.budget, 100)
  const message = cleanString(input.message, 3000)

  if (!name) return invalid("Please enter your name.")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid("Please enter a valid email address.")
  }
  if (roomType && !allowedRoomTypes.has(roomType)) return invalid("Please choose a valid room type.")
  if (budget && !allowedBudgets.has(budget)) return invalid("Please choose a valid budget.")

  const assetsResult = validateUploadedAssets(input.assets || [], options)
  if (!assetsResult.ok) return assetsResult

  return {
    ok: true,
    value: {
      name,
      email,
      artworkSize,
      preferredColors,
      roomType,
      budget,
      message,
      assets: assetsResult.value,
    },
  }
}

export function buildCustomPaintingDocument(
  request: CustomPaintingRequest,
  input: { id: string; reference: string; submittedAt: string }
) {
  return {
    _id: input.id,
    _type: "customPaintingRequest",
    requestReference: input.reference,
    customerName: request.name,
    customerEmail: request.email,
    artworkSize: request.artworkSize,
    preferredColors: request.preferredColors,
    roomType: request.roomType,
    budget: request.budget,
    message: request.message,
    referenceImages: request.assets.map((asset, index) => ({
      _type: "cloudflareAsset",
      _key: `${input.reference.replace(/[^a-zA-Z0-9]/g, "")}${index}`.slice(-12),
      url: asset.url,
      key: asset.key,
      alt: `Reference image from ${request.name}`,
      contentType: asset.contentType,
      originalName: asset.originalName,
      size: asset.size,
    })),
    status: "new",
    source: "website-custom-painting",
    notificationStatus: "pending",
    submittedAt: input.submittedAt,
  }
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function invalid(error: string): ValidationResult<never> {
  return { ok: false, error }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
