import Header from "@/components/Header"
import Link from "next/link"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { ArtworksPageHeroCopy } from "@/components/ArtworksPageCopy"
import { client } from "@/lib/sanity"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"
import { buildArtworkDiscoveryInitialState, buildArtworkDiscoveryItem } from "@/lib/artwork-discovery"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { normalizeCategory, pickEnglish } from "@/lib/artwork-display"
import { buildArtworkCategorySeoMetadata, getPopulatedArtworkCategories, resolveArtworkCategoryFilter } from "@/lib/artwork-category-seo"
import { normalizePublicArtworkFramingNotes } from "@/lib/storefront/framing-notes"

export const revalidate = 600

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getArtworks() {
  const artworks = await client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc){
    ...,
    artist->{name}
  }`)
  return Array.isArray(artworks) ? artworks.map(normalizePublicArtworkFramingNotes) : []
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

  const artworks = await client.fetch(
    `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && category in $categories] | order(featured desc, _createdAt desc){
      ...,
      artist->{name}
    }`,
    { categories: legacyCategories[category] || [category] }
  )
  return Array.isArray(artworks) ? artworks.map(normalizePublicArtworkFramingNotes) : []
}

async function getSeoImage(category?: string) {
  const artworks = await getCategoryArtworks(category).catch(() => null)
  if (!artworks) return undefined
  const artworkWithImage = artworks.find(hasArtworkImage)

  if (!artworkWithImage) return { count: artworks.length }

  return {
    count: artworks.length,
    image: getArtworkImageUrl(artworkWithImage, { width: 1200, height: 630 }),
    alt: pickEnglish(artworkWithImage.title, "Hand-painted YiiArt painting"),
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams
  const requestedCategory = firstQueryValue(params.category)
  const categoryMetadata = buildArtworkCategorySeoMetadata(requestedCategory)
  const activeCategory = categoryMetadata.category || (categoryMetadata.robots ? undefined : normalizeCategory(requestedCategory))
  const seoImage = await getSeoImage(activeCategory)

  return buildSeoMetadata({
    title: categoryMetadata.title,
    description: categoryMetadata.description,
    path: categoryMetadata.path,
    robots: buildArtworkCategorySeoMetadata(requestedCategory, seoImage?.count).robots,
    image: seoImage?.image,
    imageAlt: seoImage?.alt,
  })
}

export default async function ArtworksPage({ searchParams }: Props) {
  const params = await searchParams
  const requestedCategory = firstQueryValue(params.category)
  const activeCategory = resolveArtworkCategoryFilter(requestedCategory) || ""
  const initialDiscovery = buildArtworkDiscoveryInitialState(params)
  const [artworks, categoryInventory] = await Promise.all([
    getCategoryArtworks(activeCategory).catch(() => []),
    client.fetch<Array<{ category?: string | null }>>(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}]{category}`).catch(() => []),
  ])
  const categoryLinks = getPopulatedArtworkCategories(categoryInventory)
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

          <nav aria-label="Artwork styles" className="mb-8 flex flex-wrap gap-x-6 gap-y-1 border-b border-stone-200 pb-3 text-sm">
            <Link href="/artworks" aria-current={!activeCategory ? "page" : undefined} className="inline-flex min-h-11 items-center underline underline-offset-4">All artworks</Link>
            {categoryLinks.map((category) => (
              <Link key={category} href={`/artworks?category=${encodeURIComponent(category)}`} aria-current={activeCategory === category ? "page" : undefined} className="inline-flex min-h-11 items-center underline underline-offset-4">
                {category}
              </Link>
            ))}
          </nav>

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
