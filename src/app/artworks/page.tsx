import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { ArtworksPageHeroCopy, CuratedPathsCopy, LivingRoomsLinkCopy } from "@/components/ArtworksPageCopy"
import { client, urlFor } from "@/lib/sanity"
import { buildSeoMetadata } from "@/lib/seo"
import { storefrontCollectionTiles } from "@/lib/storefront-content"
import { buildArtworkDiscoveryItem } from "@/lib/artwork-discovery"
import { normalizeCategory, pickEnglish } from "@/lib/artwork-display"

export const revalidate = 600

interface Props {
  searchParams: Promise<{ category?: string }>
}

async function getArtworks() {
  return client.fetch(`*[_type == "artwork"] | order(featured desc, _createdAt desc){
    ...,
    artist->{name}
  }`)
}

async function getCategoryArtworks(category?: string) {
  if (!category) return getArtworks()

  const legacyCategories: Record<string, string[]> = {
    Abstract: ["Abstract", "抽象"],
    Landscape: ["Landscape", "景观"],
    Portrait: ["Portrait", "肖像"],
    Texture: ["Texture", "肌理"],
    Minimalist: ["Minimalist", "极简"],
  }

  return client.fetch(
    `*[_type == "artwork" && category in $categories] | order(featured desc, _createdAt desc)[0...12]{
      ...,
      artist->{name}
    }`,
    { categories: legacyCategories[category] || [category] }
  )
}

async function getSeoImage(category?: string) {
  const artworks = await getCategoryArtworks(category).catch(() => [])
  const artworkWithImage = artworks.find((artwork: any) => artwork.images?.[0])

  if (!artworkWithImage?.images?.[0]) return undefined

  return {
    image: urlFor(artworkWithImage.images[0]).width(1200).height(630).url(),
    alt: pickEnglish(artworkWithImage.title, "Original YiiArt painting"),
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = normalizeCategory(params.category)
  const seoImage = await getSeoImage(activeCategory)
  const title = activeCategory ? `${activeCategory} Original Paintings` : "Original Paintings"
  const description = activeCategory
    ? `Browse ${activeCategory.toLowerCase()} original paintings from YiiArt, each hand-painted and shipped worldwide with a signed certificate.`
    : "Browse original abstract, landscape, portrait, textured, and minimalist paintings hand-painted on canvas."
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
  const activeCategory = normalizeCategory(params.category)
  const artworks = await getCategoryArtworks(activeCategory).catch(() => [])
  const artworkItems = artworks.map((artwork: any) => {
    const imageUrl = artwork.images?.[0] ? urlFor(artwork.images[0]).width(700).url() : undefined
    return buildArtworkDiscoveryItem(artwork, imageUrl)
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <ArtworksPageHeroCopy activeCategory={activeCategory} />

          <section className="mb-14 border-y py-8">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <CuratedPathsCopy />
              <a href="/collections/abstract-art-for-living-room" className="text-sm underline underline-offset-4">
                <LivingRoomsLinkCopy />
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {storefrontCollectionTiles.map((collection) => (
                <a key={collection.href} href={collection.href} className="border p-4 transition hover:bg-gray-50">
                  <p className="text-xs uppercase tracking-wider text-gray-500">{collection.eyebrow}</p>
                  <h3 className="mt-2 font-medium">{collection.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{collection.meta}</p>
                </a>
              ))}
            </div>
          </section>

          <ArtworkDiscoveryGrid
            items={artworkItems}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
