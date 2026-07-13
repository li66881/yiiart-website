import Link from "next/link"
import { PriceText } from "@/components/PriceText"
import {
  formatArtworkDimensions,
  normalizeCategory,
  normalizeMedium,
  pickEnglish,
} from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"

export type RelatedArtwork = {
  _id: string
  title?: { en?: string; zh?: string } | string
  slug?: { current?: string }
  price?: number
  dimensions?: string
  widthCm?: number
  heightCm?: number
  medium?: string
  category?: string
  cloudflareImages?: unknown[]
  images?: unknown[]
}

export default function ArtworkSimilarStrip({ artworks }: { artworks: RelatedArtwork[] }) {
  if (artworks.length === 0) return null

  return (
    <section className="mt-10 border-t border-[#ded8ce] pt-8 lg:mt-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl font-light lg:text-4xl">Visually Similar Artworks</h2>
        <Link href="/artworks" className="shrink-0 text-sm underline underline-offset-4">View all artworks</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {artworks.map((artwork) => <RelatedArtworkCard key={artwork._id} artwork={artwork} />)}
      </div>
    </section>
  )
}

function RelatedArtworkCard({ artwork }: { artwork: RelatedArtwork }) {
  const href = `/artwork/${artwork.slug?.current || artwork._id}`
  const image = getArtworkImageUrl(artwork, { width: 700, height: 900 })
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f1eee7]">
        {image
          ? <img src={image} alt={`${title}, related handmade artwork`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#6f675d]">Artwork image available on request</div>}
      </div>
      <div className="pt-3">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[#6f675d]">{[category, medium].filter(Boolean).join(" / ")}</p>
        <h3 className="mt-1.5 font-medium leading-snug">{title}</h3>
        <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="text-[#6f675d]">{formatArtworkDimensions(artwork)}</span>
          <span className="font-semibold"><PriceText amountCny={Number(artwork.price || 0)} /></span>
        </div>
      </div>
    </Link>
  )
}
