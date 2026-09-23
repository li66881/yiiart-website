export type SocialLinkPick = {
  slug: string
  pairingNote: string
}

export const FEATURED_SOCIAL_LINK_PICKS: SocialLinkPick[] = [
  {
    slug: "orange-grove-elephant",
    pairingNote: "Warm ivory and pale blue with quiet orange accents, for rooms that need character without noise.",
  },
  {
    slug: "electric-pink-meadow",
    pairingNote: "Hot pink, violet and acid green for interiors that can carry colour with confidence.",
  },
  {
    slug: "white-peony-relief",
    pairingNote: "A single peony in warm white and blush pink, suited to a bedroom or quiet living-room wall.",
  },
  {
    slug: "pastel-meadow",
    pairingNote: "Blush, butter yellow and peach florals for a gentle colour lift in a cream or light-wood room.",
  },
  {
    slug: "walled-garden",
    pairingNote: "Sage green botanical layers for a garden-inspired living or dining wall.",
  },
]

export function orderSocialLinkPicks<
  T extends {
    slug?: { current?: string } | string | null
    availability?: string | null
  },
>(
  artworks: T[],
  picks = FEATURED_SOCIAL_LINK_PICKS,
) {
  const bySlug = new Map(
    artworks.map((artwork) => {
      const slug = typeof artwork.slug === "string" ? artwork.slug : artwork.slug?.current || ""
      return [slug, artwork] as const
    }),
  )

  return picks.flatMap((pick) => {
    const artwork = bySlug.get(pick.slug)
    return artwork ? [{ pick, artwork }] : []
  })
}
