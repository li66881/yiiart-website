import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { ArtworksPageHeroCopy, CuratedPathsCopy, LivingRoomsLinkCopy } from "@/components/ArtworksPageCopy"
import { StorefrontCollectionSummary } from "@/components/StorefrontCollectionCopy"
import { client } from "@/lib/sanity"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"
import { storefrontCollectionTiles } from "@/lib/storefront-content"
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

      <main className="flex-1 pb-20 pt-[calc(var(--yiiart-header-offset)+48px)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <ArtworksPageHeroCopy activeCategory={activeCategory} />

          <section className="mb-14 border-y border-stone-200 bg-[#f2eee7] px-4 py-8 sm:px-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <CuratedPathsCopy />
              <a href="/collections/abstract-art-for-living-room" className="text-sm underline underline-offset-4">
                <LivingRoomsLinkCopy />
              </a>
            </div>
            <div className="flex snap-x gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {storefrontCollectionTiles.map((collection) => (
                <a key={collection.href} href={collection.href} className="min-w-[76vw] snap-start border-l border-stone-300 py-1 pl-4 transition hover:border-stone-900 md:min-w-0">
                  <StorefrontCollectionSummary collection={collection} />
                </a>
              ))}
            </div>
          </section>

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
