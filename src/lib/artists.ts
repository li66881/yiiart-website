export type LocalizedArtistText = {
  en?: string
  zh?: string
}

export type ArtistRecord = {
  _id: string
  _createdAt?: string
  name?: LocalizedArtistText
  slug?: {
    current?: string
  } | null
  location?: string
  style?: string[]
  bio?: LocalizedArtistText
  image?: unknown
  artworkCount?: number
}

export type CanonicalArtistRecord = ArtistRecord & {
  canonicalArtistId: string
  duplicateArtistIds: string[]
}

export function mergeDuplicateArtists(artists: ArtistRecord[]): CanonicalArtistRecord[] {
  const groups = new Map<string, ArtistRecord[]>()
  const groupOrder: string[] = []

  for (const artist of artists) {
    const key = getArtistNameKey(artist)
    if (!groups.has(key)) {
      groups.set(key, [])
      groupOrder.push(key)
    }
    groups.get(key)?.push(artist)
  }

  return groupOrder
    .map((key) => mergeArtistGroup(groups.get(key) || []))
    .filter((artist): artist is CanonicalArtistRecord => Boolean(artist))
}

export function resolveCanonicalArtistForSlug(artists: ArtistRecord[], slug: string) {
  const requested = normalizeSlug(slug)
  if (!requested) return null

  const matched = artists.find((artist) => (
    normalizeSlug(artist.slug?.current) === requested
    || normalizeSlug(artist._id) === requested
  ))

  if (!matched) return null

  const key = getArtistNameKey(matched)
  return mergeArtistGroup(artists.filter((artist) => getArtistNameKey(artist) === key))
}

function mergeArtistGroup(group: ArtistRecord[]): CanonicalArtistRecord | null {
  if (group.length === 0) return null

  const canonical = group.slice().sort(compareCanonicalArtists)[0]
  const publicSlug = getPublicSlug(canonical, group)

  return {
    ...canonical,
    slug: publicSlug ? { current: publicSlug } : canonical.slug,
    canonicalArtistId: canonical._id,
    duplicateArtistIds: group
      .map((artist) => artist._id)
      .filter((id) => id !== canonical._id),
  }
}

function compareCanonicalArtists(a: ArtistRecord, b: ArtistRecord) {
  return (
    numericRank(b.artworkCount) - numericRank(a.artworkCount)
    || textLength(b.bio?.en) - textLength(a.bio?.en)
    || textLength(b.bio?.zh) - textLength(a.bio?.zh)
    || Number(Boolean(b.slug?.current)) - Number(Boolean(a.slug?.current))
    || dateRank(a._createdAt) - dateRank(b._createdAt)
  )
}

function getPublicSlug(canonical: ArtistRecord, group: ArtistRecord[]) {
  return normalizeSlug(canonical.slug?.current)
    || group.map((artist) => normalizeSlug(artist.slug?.current)).find(Boolean)
    || normalizeSlug(canonical._id)
}

function getArtistNameKey(artist: ArtistRecord) {
  const name = artist.name?.en || artist.name?.zh || artist._id
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "")
}

function normalizeSlug(value?: string | null) {
  return String(value || "").trim()
}

function numericRank(value?: number) {
  return Number.isFinite(value) ? Number(value) : 0
}

function textLength(value?: string) {
  return String(value || "").trim().length
}

function dateRank(value?: string) {
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}
