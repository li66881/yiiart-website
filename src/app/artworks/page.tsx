import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { client, urlFor } from '@/lib/sanity'

interface Props {
  searchParams: Promise<{ category?: string }>
}

async function getArtworks(category?: string) {
  if (category) {
    return client.fetch(
      `*[_type == "artwork" && category == $category] | order(_createdAt desc)`,
      { category }
    )
  }
  return client.fetch(`*[_type == "artwork"] | order(_createdAt desc)`)
}

export default async function ArtworksPage({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = params.category
  const artworks = await getArtworks(activeCategory)

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
              All
            </a>
            {categories.map(cat => (
              <a 
                key={cat}
                href={`/artworks?category=${cat}`}
                className={`px-4 py-2 transition ${activeCategory === cat ? "bg-black text-white" : "border hover:bg-black hover:text-white"}`}
              >
                {cat}
              </a>
            ))}
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
                        alt={artwork.title?.zh || artwork.title?.en || "Artwork"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {artwork.category} · {artwork.medium}
                  </p>
                  <h3 className="font-medium mt-1">
                    {artwork.title?.zh || artwork.title?.en}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {artwork.artist?.name?.zh || artwork.artist?.name?.en}
                  </p>
                  <p className="mt-1 font-semibold">
                    ¥{artwork.price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {artwork.dimensions}
                  </p>
                </div>
              </a>
            )) : (
              <p className="col-span-4 text-gray-500">
                {activeCategory 
                  ? `No ${activeCategory} artworks yet.` 
                  : "No artworks yet."} Add some in Sanity Studio!
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
