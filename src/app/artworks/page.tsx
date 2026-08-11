import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { ArtworksPageHeroCopy } from "@/components/ArtworksPageCopy"
import { client } from "@/lib/sanity"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"
import { buildArtworkDiscoveryInitialState, buildArtworkDiscoveryItem } from "@/lib/artwork-discovery"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { normalizeCategory, pickEnglish } from "@/lib/artwork-display"

export const revalidate = 600

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getArtworks() {
  return client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc){
    ...,
    artist->{name}
  }`)
}

async function getCategoryArtworks(category?: string) {
  if (!category) return getArtworks()

  const legacyCategories: Record<string, string[]> = {
    Abstract: ["Abstract", "鎶借薄", "抽象"],
    Landscape: ["Landscape", "鏅", "景观"],
    Portrait: ["Portrait", "鑲栧儚", "肖像"],
    Texture: ["Texture", "Textured Art", "鑲岀悊", "肌理"],
    Minimalist: ["Minimalist", "鏋佺畝", "极简"],
  }

  return client.fetch(
    `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && category in $categories] | order(featured desc, _createdAt desc)[0...12]{
      ...,
      artist->{name}
    }`,
    { categories: legacyCategories[category] || [category] }
  )
}

async function getSeoImage(category?: string) {
  const artworks = await getCategoryArtworks(category).catch(() => [])
  const artworkWithImage = artworks.find(hasArtworkImage)

  if (!artworkWithImage) return undefined

  return {
    image: getArtworkImageUrl(artworkWithImage, { width: 1200, height: 630 }),
    alt: pickEnglish(artworkWithImage.title, "Hand-painted YiiArt painting"),
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = normalizeCategory(firstQueryValue(params.category))
  const seoImage = await getSeoImage(activeCategory)
  const title = activeCategory ? `${activeCategory} Hand-Painted Paintings` : "Hand-Painted Paintings"
  const description = activeCategory
    ? `Browse ${activeCategory.toLowerCase()} hand-painted paintings from YiiArt, with size, palette, and delivery guidance confirmed before ordering.`
    : "Browse abstract, landscape, portrait, textured, and minimalist paintings hand-painted on canvas."
  const path = activeCategory ? `/artworks?category=${encodeURIComponent(activeCategory)}` : "/artworks"

  return buildSeoMetadata({
    title,
    description,
    path,
    image: seoImage?.image,
    imageAlt: seoImage?.alt,
  })
}

export default async function ArtworksPage({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = normalizeCategory(firstQueryValue(params.category))
  const initialDiscovery = buildArtworkDiscoveryInitialState(params)
  const artworks = await getCategoryArtworks(activeCategory).catch(() => [])
  const artworkItems = artworks.map((artwork: any) => {
    const imageUrl = getArtworkImageUrl(artwork, { width: 700 })
    return buildArtworkDiscoveryItem(artwork, imageUrl)
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />

      <main className="flex-1 pb-20 pt-[calc(var(--yiiart-header-offset)+30px)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <ArtworksPageHeroCopy activeCategory={activeCategory} />

          <ArtworkDiscoveryGrid
            items={artworkItems}
            initialFilters={initialDiscovery.filters}
            initialSort={initialDiscovery.sortMode}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function firstQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}
