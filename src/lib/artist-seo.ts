const metaDescriptionLimit = 160

export function buildArtistMetaDescription(artistName: string, biography?: string | null) {
  const cleanBiography = biography?.replace(/\s+/g, " ").trim()
  if (!cleanBiography) {
    return `Discover ${artistName}'s artist profile and browse available paintings at YiiArt.`
  }

  const suffix = ` Explore paintings by ${artistName}.`
  const maxBiographyLength = metaDescriptionLimit - suffix.length
  if (cleanBiography.length <= maxBiographyLength) return `${cleanBiography}${suffix}`

  const excerptLimit = maxBiographyLength - 3
  const sentenceBoundaries = [...cleanBiography.slice(0, maxBiographyLength).matchAll(/[.!?。！？](?=\s|$)/g)]
    .map((match) => match.index! + match[0].length)
    .filter((index) => index >= 75)
  const sentenceEnd = sentenceBoundaries.at(-1)
  if (sentenceEnd) return `${cleanBiography.slice(0, sentenceEnd).trim()}${suffix}`

  const wordBoundary = cleanBiography.lastIndexOf(" ", excerptLimit)
  const excerpt = cleanBiography
    .slice(0, wordBoundary > 0 ? wordBoundary : excerptLimit)
    .replace(/[\s,;:.!?-]+$/, "")

  return `${excerpt}...${suffix}`
}
