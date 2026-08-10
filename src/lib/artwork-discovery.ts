import {
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  parseArtworkDimensionsCm,
  pickEnglish,
} from "@/lib/artwork-display"

export type ArtworkFilterKey = "styles" | "rooms" | "colors" | "sizes" | "orientations"
export type ArtworkCollectionTab = "all" | "new_collection" | "artist_collection"
export type ArtworkSortMode = "featured" | "newest" | "price-asc" | "price-desc" | "large-first"
export type ArtworkDiscoveryQuery = Record<string, string | string[] | undefined>

export type ArtworkFilterState = Record<ArtworkFilterKey, string[]>

export type ArtworkDiscoveryItem = {
  id: string
  href: string
  imageUrl?: string
  title: string
  artistName: string
  category: string
  medium: string
  price?: number | null
  dimensions: string
  rawDimensions?: string | null
  createdAt?: string
  featured: boolean
  styles: string[]
  rooms: string[]
  colors: string[]
  size: string
  orientation: string
  collectionType: "new_collection" | "artist_collection"
  productionModel: "hand_painted_to_order" | "original"
  handmade: boolean
  customRequestAvailable: boolean
}

export type ArtworkFilterGroup = {
  key: ArtworkFilterKey
  label: string
  options: string[]
}

export const artworkFilterGroups: ArtworkFilterGroup[] = [
  {
    key: "styles",
    label: "Style",
    options: ["Abstract", "Landscape", "Portrait", "Texture", "Wabi-sabi", "Minimalist"],
  },
  {
    key: "rooms",
    label: "Room",
    options: ["Living Room", "Bedroom", "Dining Room", "Entryway", "Office", "Hospitality Space"],
  },
  {
    key: "colors",
    label: "Color",
    options: ["Neutral", "White", "Black", "Gray", "Blue", "Green", "Red", "Pink", "Yellow", "Orange", "Earth Tone", "Multicolor"],
  },
  {
    key: "sizes",
    label: "Size",
    options: ["Small", "Medium", "Large", "Oversized"],
  },
  {
    key: "orientations",
    label: "Orientation",
    options: ["Portrait", "Landscape", "Square"],
  },
]

export const emptyArtworkFilters: ArtworkFilterState = {
  styles: [],
  rooms: [],
  colors: [],
  sizes: [],
  orientations: [],
}

export function normalizeArtworkFilters(initial?: Partial<ArtworkFilterState>): ArtworkFilterState {
  return {
    styles: unique(initial?.styles || []),
    rooms: unique(initial?.rooms || []),
    colors: unique(initial?.colors || []),
    sizes: unique(initial?.sizes || []),
    orientations: unique(initial?.orientations || []),
  }
}

export function buildArtworkDiscoveryInitialState(query: ArtworkDiscoveryQuery) {
  return {
    sortMode: normalizeArtworkSort(query.sort),
    filters: normalizeArtworkFilters({
      styles: normalizeQueryOptions("styles", query.style),
      rooms: normalizeQueryOptions("rooms", query.room),
      colors: normalizeQueryOptions("colors", query.color),
      sizes: normalizeQueryOptions("sizes", query.size),
      orientations: normalizeQueryOptions("orientations", query.orientation),
    }),
  }
}

export function normalizeArtworkSort(value?: string | string[]) : ArtworkSortMode {
  const candidate = Array.isArray(value) ? value[0] : value
  const allowed: ArtworkSortMode[] = ["featured", "newest", "price-asc", "price-desc", "large-first"]
  return allowed.includes(candidate as ArtworkSortMode) ? candidate as ArtworkSortMode : "featured"
}

export function buildArtworkDiscoveryItem(artwork: any, imageUrl?: string): ArtworkDiscoveryItem {
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)
  const productionModel = artwork.productionModel === "hand_painted_to_order" ? "hand_painted_to_order" : "original"
  const standardSize = Array.isArray(artwork.standardSizes)
    ? artwork.standardSizes.find((size: any) => Number(size?.priceCny) > 0)
    : undefined
  const dimensions = formatArtworkDimensions(artwork) || String(standardSize?.label || "")
  const orientation = normalizeOrientation(artwork.orientation) || inferArtworkOrientation(dimensions)
  const size = inferArtworkSize(dimensions)
  const rooms = normalizeList(artwork.roomTypes).map(normalizeRoom)
  const colors = normalizeList(artwork.colorFamilies).map(normalizeColor)
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const artistName = pickEnglish(artwork.artist?.name, "YiiArt")

  return {
    id: artwork._id || artwork.slug?.current || title,
    href: artwork.slug?.current ? `/artwork/${artwork.slug.current}` : "/artworks",
    imageUrl,
    title,
    artistName,
    category,
    medium,
    price: productionModel === "hand_painted_to_order" ? standardSize?.priceCny : artwork.price,
    dimensions,
    rawDimensions: artwork.dimensions,
    createdAt: artwork._createdAt,
    featured: artwork.featured === true,
    styles: unique([category].filter(Boolean)),
    rooms: unique(rooms.length > 0 ? rooms : inferRooms(category)),
    colors: unique(colors.length > 0 ? colors : inferColors(artwork, category)),
    size,
    orientation,
    collectionType: artwork.collectionType === "new_collection" ? "new_collection" : "artist_collection",
    productionModel,
    handmade: true,
    customRequestAvailable: true,
  }
}

export function artworkMatchesCollection(item: ArtworkDiscoveryItem, collection: ArtworkCollectionTab) {
  return collection === "all" || item.collectionType === collection
}

export function artworkMatchesFilters(item: ArtworkDiscoveryItem, filters: ArtworkFilterState) {
  return (
    matchesAny(item.styles, filters.styles)
    && matchesAny(item.rooms, filters.rooms)
    && matchesAny(item.colors, filters.colors)
    && matchesAny([item.size], filters.sizes)
    && matchesAny([item.orientation], filters.orientations)
  )
}

export function countActiveArtworkFilters(filters: ArtworkFilterState) {
  return Object.values(filters).reduce((count, values) => count + values.length, 0)
}

export function sortArtworkDiscoveryItems(items: ArtworkDiscoveryItem[], sortMode: ArtworkSortMode) {
  return items.slice().sort((a, b) => {
    if (sortMode === "price-asc") return priceValue(a, Number.MAX_SAFE_INTEGER) - priceValue(b, Number.MAX_SAFE_INTEGER)
    if (sortMode === "price-desc") return priceValue(b, Number.MIN_SAFE_INTEGER) - priceValue(a, Number.MIN_SAFE_INTEGER)
    if (sortMode === "large-first") return sizeRank(b.size) - sizeRank(a.size)
    if (sortMode === "newest") return dateValue(b.createdAt) - dateValue(a.createdAt)

    const featuredDifference = Number(b.featured) - Number(a.featured)
    return featuredDifference || dateValue(b.createdAt) - dateValue(a.createdAt)
  })
}

export function inferArtworkSize(dimensions?: string | null) {
  const parsed = parseDimensionsCm(dimensions)
  if (!parsed) return "Medium"

  const longest = Math.max(parsed.width, parsed.height)
  const area = parsed.width * parsed.height

  if (longest >= 150 || area >= 15000) return "Oversized"
  if (longest >= 100 || area >= 8000) return "Large"
  if (longest < 70) return "Small"
  return "Medium"
}

export function inferArtworkOrientation(dimensions?: string | null) {
  const parsed = parseDimensionsCm(dimensions)
  if (!parsed) return "Portrait"

  const difference = Math.abs(parsed.width - parsed.height)
  if (difference <= Math.max(parsed.width, parsed.height) * 0.08) return "Square"
  return parsed.width > parsed.height ? "Landscape" : "Portrait"
}

export function parseDimensionsCm(dimensions?: string | null) {
  return parseArtworkDimensionsCm(dimensions)
}

function matchesAny(values: string[], active: string[]) {
  if (active.length === 0) return true
  return active.some((value) => values.includes(value))
}

function normalizeQueryOptions(key: ArtworkFilterKey, value?: string | string[]) {
  const requested = (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean)
  const allowed = artworkFilterGroups.find((group) => group.key === key)?.options || []

  return unique(requested.map((entry) => allowed.find((option) => option.toLowerCase() === entry.toLowerCase()) || ""))
}

function priceValue(item: ArtworkDiscoveryItem, fallback: number) {
  return typeof item.price === "number" ? item.price : fallback
}

function dateValue(value?: string) {
  return value ? new Date(value).getTime() || 0 : 0
}

function sizeRank(size: string) {
  const ranks: Record<string, number> = {
    Small: 1,
    Medium: 2,
    Large: 3,
    Oversized: 4,
  }
  return ranks[size] || 0
}

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || "").trim()).filter(Boolean)
}

function normalizeRoom(value: string) {
  const map: Record<string, string> = {
    "Living room": "Living Room",
    "Dining room": "Dining Room",
    Entryway: "Entryway",
    Office: "Office",
    Bedroom: "Bedroom",
    "Hospitality space": "Hospitality Space",
  }
  return map[value] || value
}

function normalizeColor(value: string) {
  const map: Record<string, string> = {
    Neutral: "Neutral",
    White: "White",
    Black: "Black",
    Gray: "Gray",
    Grey: "Gray",
    Blue: "Blue",
    Green: "Green",
    Red: "Red",
    Pink: "Pink",
    Yellow: "Yellow",
    Orange: "Orange",
    "Earth tone": "Earth Tone",
    "Earth Tone": "Earth Tone",
    Multicolor: "Multicolor",
  }
  return map[value] || value
}

function normalizeOrientation(value?: string | null) {
  if (!value) return ""
  if (value === "Horizontal") return "Landscape"
  if (value === "Vertical") return "Portrait"
  return value
}

function inferRooms(category: string) {
  const map: Record<string, string[]> = {
    Abstract: ["Living Room", "Bedroom", "Office"],
    Landscape: ["Living Room", "Dining Room", "Office"],
    Portrait: ["Bedroom", "Office"],
    Texture: ["Living Room", "Entryway", "Bedroom"],
    "Wabi-sabi": ["Bedroom", "Entryway", "Living Room"],
    Minimalist: ["Bedroom", "Office", "Entryway"],
  }
  return map[category] || ["Living Room", "Office"]
}

function inferColors(artwork: any, category: string) {
  const searchable = [
    pickEnglish(artwork.title),
    pickEnglish(artwork.description),
    normalizeList(artwork.seoKeywords).join(" "),
  ].join(" ").toLowerCase()

  const colorMatches: Array<[string, RegExp]> = [
    ["Blue", /\bblue|azure|navy|cyan\b/],
    ["Green", /\bgreen|olive|sage|forest\b/],
    ["Red", /\bred|crimson\b/],
    ["Pink", /\bpink|rose|blush\b/],
    ["Yellow", /\byellow|gold|ochre\b/],
    ["Orange", /\borange|amber\b/],
    ["Black", /\bblack|ink|charcoal\b/],
    ["Gray", /\bgray|grey|silver\b/],
    ["White", /\bwhite|ivory|cream\b/],
    ["Earth Tone", /\bearth|brown|sand|taupe|terracotta|beige\b/],
  ]

  const detected = colorMatches.filter(([, pattern]) => pattern.test(searchable)).map(([color]) => color)
  if (detected.length > 0) return detected

  const fallback: Record<string, string[]> = {
    Landscape: ["Blue", "Green", "Earth Tone"],
    Texture: ["Neutral", "Earth Tone", "White"],
    "Wabi-sabi": ["Neutral", "Earth Tone"],
    Minimalist: ["Neutral", "White", "Black"],
    Portrait: ["Neutral", "Red"],
    Abstract: ["Neutral", "Blue", "Multicolor"],
  }

  return fallback[category] || ["Neutral"]
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}
