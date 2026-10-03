export type ArtistIdentity = {
  id?: string | null
  name?: {
    en?: string | null
    zh?: string | null
  } | null
}

function normalizeName(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ").toLocaleLowerCase() || ""
}

export function matchesArtistIdentity(left: ArtistIdentity, right: ArtistIdentity) {
  if (left.id && right.id && left.id === right.id) return true

  const leftEnglishName = normalizeName(left.name?.en)
  const rightEnglishName = normalizeName(right.name?.en)
  const leftChineseName = normalizeName(left.name?.zh)
  const rightChineseName = normalizeName(right.name?.zh)

  return Boolean(
    leftEnglishName &&
    rightEnglishName &&
    leftChineseName &&
    rightChineseName &&
    leftEnglishName === rightEnglishName &&
    leftChineseName === rightChineseName
  )
}
