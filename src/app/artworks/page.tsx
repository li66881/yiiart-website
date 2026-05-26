import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Original Paintings",
  description: "Browse our full collection of original paintings: abstract, landscape, minimalist, and textured works hand-painted on canvas. Each piece is one of a kind and ships worldwide.",
  openGraph: {
    title: "Original Paintings | YiiArt",
    description: "Browse our full collection of original paintings: abstract, landscape, minimalist, and textured works hand-painted on canvas.",
  },
  robots: { index: true, follow: true },
}

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { client, urlFor } from '@/lib/sanity'
import { formatDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { formatStorePrice, getPriceDisclosure } from "@/lib/pricing"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ category?: string }>
}

async function getArtworks(category?: string) {
  if (category) {
    const legacyCategories: Record<string, string[]> = {
      Abstract: ["Abstract", "抽象"],
      Landscape: ["Landscape", "景观"],
      Portrait: ["Portrait", "肖像"],
      Texture: ["Texture", "肌理"],
      Minimalist: ["Minimalist", "极简"],
    }

    return client.fetch(
      `*[_type == "artwork" && category in $categories] | order(_createdAt desc){
        ...,
        artist->{name}
      }`,
      { categories: legacyCategories[category] || [category] }
    )
  }
  return client.fetch(`*[_type == "artwork"] | order(_createdAt desc){
    ...,
    artist->{name}
  }`)
}

export default async function ArtworksPage({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = params.category
  const [artworks, allArtworks] = await Promise.all([
    getArtworks(activeCategory),
    client.fetch(`count(*[_type == "artwork"])`),
  ])

  const categories = ["Abstract", "Landscape", "Portrait", "Texture", "Wabi-sabi"]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light mb-8">
            {activeCategory ? `${activeCategory} Artworks` : "All Artworks"}
          </h1>
          
          {/* Category Filter */}
          <div className="flex gap-4 mb-12 flex-wrap">
            <a 
              href="/artworks" 
              className={`px-4 py-2 transition ${!activeCategory ? "bg-black text-white" : "border hover:bg-black hover:text-white"}`}
            >
              All ({allArtworks})
            </a>
            {categories.map(cat => {
              const count = artworks.filter((a: any) => {
                if (cat === "Texture") return a.category === "Texture" || a.category === "肌理"
                if (cat === "Wabi-sabi") return a.category === "Wabi-sabi"
                return a.category === cat
              }).length
              return (
                <a 
                  key={cat}
                  href={`/artworks?category=${cat}`}
                  className={`px-4 py-2 transition ${activeCategory === cat ? "bg-black text-white" : "border hover:bg-black hover:text-white"}`}
                >
                  {cat} ({count})
                </a>
              )
            })}
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.length > 0 ? artworks.map((artwork: any) => (
              <a key={artwork._id} href={`/artwork/${artwork.slug.current}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    {artwork.images?.[0] && (
                      <img 
                        src={urlFor(artwork.images[0]).width(600).url()} 
                        alt={pickEnglish(artwork.title, "Artwork")} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {[normalizeCategory(artwork.category), normalizeMedium(artwork.medium)].filter(Boolean).join(" / ")}
                  </p>
                  <h3 className="font-medium mt-1">
                    {pickEnglish(artwork.title, "Untitled artwork")}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pickEnglish(artwork.artist?.name, "YiiArt artist")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatStorePrice(artwork.price)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDimensions(artwork.dimensions)}
                  </p>
                </div>
              </a>
            )) : (
              <p className="col-span-4 text-gray-500">
                {activeCategory 
                  ? `No ${activeCategory} artworks yet.` 
                  : "New artworks are being prepared for release."}
              </p>
            )}
          </div>
          {artworks.length > 0 && (
            <p className="mt-8 text-center text-xs text-gray-500">{getPriceDisclosure()}</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
