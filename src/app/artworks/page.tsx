import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'

async function getArtworks() {
  return client.fetch(`*[_type == "artwork"] | order(_createdAt desc)`)
}

export default async function ArtworksPage() {
  const artworks = await getArtworks()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-light">Yii<span className="font-medium">Art</span></Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/artworks" className="hover:text-gray-600">Explore</Link>
            <Link href="/artists" className="hover:text-gray-600">Artists</Link>
            <Link href="/artworks?category=Abstract" className="hover:text-gray-600">Abstract</Link>
            <Link href="/artworks?category=Texture" className="hover:text-gray-600">Texture</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">🔍</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">🛒 <span className="text-xs">2</span></button>
          </div>
        </div>
      </header>

      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light mb-8">All Artworks</h1>
          
          {/* Category Filter */}
          <div className="flex gap-4 mb-12 flex-wrap">
            <Link href="/artworks" className="px-4 py-2 bg-black text-white">All</Link>
            <Link href="/artworks?category=Abstract" className="px-4 py-2 border hover:bg-black hover:text-white transition">Abstract</Link>
            <Link href="/artworks?category=Landscape" className="px-4 py-2 border hover:bg-black hover:text-white transition">Landscape</Link>
            <Link href="/artworks?category=Portrait" className="px-4 py-2 border hover:bg-black hover:text-white transition">Portrait</Link>
            <Link href="/artworks?category=Texture" className="px-4 py-2 border hover:bg-black hover:text-white transition">Texture</Link>
            <Link href="/artworks?category=Wabi-sabi" className="px-4 py-2 border hover:bg-black hover:text-white transition">Wabi-sabi</Link>
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.length > 0 ? artworks.map((artwork: any) => (
              <Link key={artwork._id} href={`/artwork/${artwork.slug.current}`}>
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
              </Link>
            )) : (
              <p className="col-span-4 text-gray-500">No artworks yet. Add some in Sanity Studio!</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p className="text-lg mb-2">YiiArt</p>
          <p className="text-sm">Art for Your Home</p>
          <p className="text-xs mt-4">© 2024 YiiArt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
