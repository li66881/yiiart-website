import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { client, urlFor } from '@/lib/sanity'

async function getArtworks() {
  return client.fetch(`*[_type == "artwork"] | order(_createdAt desc)`)
}

export default async function ArtworksPage() {
  const artworks = await getArtworks()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light mb-8">All Artworks</h1>
          
          {/* Category Filter */}
          <div className="flex gap-4 mb-12 flex-wrap">
            <a href="/artworks" className="px-4 py-2 bg-black text-white">All</a>
            <a href="/artworks?category=Abstract" className="px-4 py-2 border hover:bg-black hover:text-white transition">Abstract</a>
            <a href="/artworks?category=Landscape" className="px-4 py-2 border hover:bg-black hover:text-white transition">Landscape</a>
            <a href="/artworks?category=Portrait" className="px-4 py-2 border hover:bg-black hover:text-white transition">Portrait</a>
            <a href="/artworks?category=Texture" className="px-4 py-2 border hover:bg-black hover:text-white transition">Texture</a>
            <a href="/artworks?category=Wabi-sabi" className="px-4 py-2 border hover:bg-black hover:text-white transition">Wabi-sabi</a>
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.length > 0 ? artworks.map((artwork: any) => (
              <a key={artwork._id} href={`/artwork/${artwork.slug.current}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    {artwork.images?.[0] && <img src={urlFor(artwork.images[0]).width(600).url()} alt={artwork.title?.zh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{artwork.category} · {artwork.medium}</p>
                  <h3 className="font-medium mt-1">{artwork.title?.zh || artwork.title?.en}</h3>
                  <p className="text-sm text-gray-500">{artwork.artist?.name?.zh}</p>
                  <p className="mt-1 font-semibold">¥{artwork.price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{artwork.dimensions}</p>
                </div>
              </a>
            )) : (
              <p className="col-span-4 text-gray-500">No artworks yet. Add some in Sanity Studio!</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
