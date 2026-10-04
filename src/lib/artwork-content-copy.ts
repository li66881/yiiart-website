type ArtworkContentCopyInput = {
  title: string
  artistName: string
  category?: string
  medium?: string | null
  colorFamilies?: string[]
  roomTypes?: string[]
  sizeCount?: number
  description?: string
  shortDescription?: string
  artworkStory?: string
}

const hasLongTemplate = (value: string) =>
  value.includes("Size and price follow YiiArt’s rolled-canvas matrix.")
  && value.includes("The piece you receive is hand-painted, not a print.")

const hasShortTemplate = (value: string) =>
  value.includes("made to order in custom sizes. The listing shows the finished composition; brushwork will vary.")

const hasStoryTemplate = (value: string) =>
  value.startsWith("This painting is part of ")
  && value.includes("The images show the approved composition, palette, and texture.")
  && value.includes("Each canvas is painted by hand to order")

export function buildArtworkContentCopy(input: ArtworkContentCopyInput) {
  const description = input.description || ""
  const shortDescription = input.shortDescription || ""
  const artworkStory = input.artworkStory || ""
  const hasTemplate = hasLongTemplate(description) || hasShortTemplate(shortDescription) || hasStoryTemplate(artworkStory)
  const colors = input.colorFamilies || []
  const rooms = input.roomTypes || []

  if (!hasTemplate) {
    return {
      about: description,
      shortDescription,
      artworkStory,
      metaDescription: description,
    }
  }

  if (!input.title || !input.artistName || !input.category || !input.medium || !colors.length || !rooms.length || !input.sizeCount) {
    return {
      about: description,
      shortDescription,
      artworkStory,
      metaDescription: description,
    }
  }

  const artForm = formatArtworkType(input.category)
  const medium = input.medium.toLowerCase()
  const palette = formatList(colors.map(formatColor))
  const roomList = formatList(rooms.map(formatRoom))
  const about = `${input.title} is a made-to-order ${artForm} in ${medium} by ${input.artistName}. Its catalog palette is ${palette}. YiiArt recommends it for ${roomList}. Choose from ${input.sizeCount} listed sizes, checking your wall and furniture measurements before ordering.`

  return {
    about,
    shortDescription: `${capitalize(artForm)} in ${medium}, hand-painted to order by ${input.artistName}. Listed palette: ${palette}; recommended for ${roomList}.`,
    artworkStory: hasStoryTemplate(artworkStory) ? "" : artworkStory,
    metaDescription: `Explore ${input.title}, a hand-painted ${artForm} in ${medium} by ${input.artistName}. Compare ${input.sizeCount} sizes; listed palette: ${palette}.`,
  }
}

function formatArtworkType(category: string) {
  const normalized = category.trim().toLowerCase()
  const knownTypes: Record<string, string> = {
    abstract: "abstract painting",
    landscape: "landscape painting",
    portrait: "portrait painting",
    figurative: "figurative painting",
    texture: "textured painting",
    "wabi-sabi": "wabi-sabi painting",
    minimalist: "minimalist painting",
  }
  return knownTypes[normalized] || `${normalized} painting`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatList(values: string[]) {
  if (values.length < 2) return values[0] || ""
  if (values.length === 2) return `${values[0]} and ${values[1]}`
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`
}

function formatColor(value: string) {
  const normalized = value.toLowerCase()
  if (normalized === "earth tone") return "earth tones"
  if (normalized === "multicolor") return "multiple colors"
  return normalized
}

function formatRoom(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.endsWith("room")) return `${normalized}s`
  if (normalized === "hospitality space") return "hospitality spaces"
  return `${normalized}s`
}
