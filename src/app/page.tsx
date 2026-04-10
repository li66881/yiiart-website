import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'

async function getFeaturedArtworks() {
  return client.fetch(`*[_type == "artwork" && featured == true][0...6]`)
}

async function getArtists() {
  return client.fetch(`*[_type == "artist"][0...6]`)
}

export default async function Home() {
  const artworks = await getFeaturedArtworks()
  const artists = await getArtists()

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

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center">
        <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-light mb-6">Choose a scene first,<br /><em>then choose art</em></h1>
          <p className="text-xl mb-8 opacity-90">Start from real home spaces to find the right size, tone, and mood.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/artworks" className="px-8 py-3 bg-white text-black hover:bg-gray-100">Browse Artworks</Link>
            <Link href="/artists" className="px-8 py-3 border border-white hover:bg-white/10">Meet Artists</Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><div className="text-3xl mb-2">🎨</div><h3 className="font-semibold">100% Original</h3><p className="text-sm text-gray-500">Signed certificate</p></div>
          <div><div className="text-3xl mb-2">📦</div><h3 className="font-semibold">Free Shipping</h3><p className="text-sm text-gray-500">Worldwide delivery</p></div>
          <div><div className="text-3xl mb-2">↩️</div><h3 className="font-semibold">30-Day Trial</h3><p className="text-sm text-gray-500">Full refund</p></div>
          <div><div className="text-3xl mb-2">❤️</div><h3 className="font-semibold">Support Artists</h3><p className="text-sm text-gray-500">80% to creators</p></div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-8">Featured Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.length > 0 ? artworks.map((artwork: any) => (
              <Link key={artwork._id} href={`/artwork/${artwork.slug.current}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    {artwork.images?.[0] && <img src={urlFor(artwork.images[0]).width(600).url()} alt={artwork.title?.zh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <h3 className="font-medium">{artwork.title?.zh || artwork.title?.en}</h3>
                  <p className="text-gray-500 text-sm">{artwork.artist?.name?.zh}</p>
                  <p className="mt-1">¥{artwork.price?.toLocaleString()}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-3 text-gray-500">No featured artworks yet. Add some in Sanity Studio!</p>
            )}
          </div>
          <div className="text-center mt-12">
            <Link href="/artworks" className="px-8 py-3 border border-black hover:bg-black hover:text-white transition">View All Artworks</Link>
          </div>
        </div>
      </section>

      {/* Artists */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-8">Our Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {artists.length > 0 ? artists.map((artist: any) => (
              <Link key={artist._id} href={`/artist/${artist.slug.current}`}>
                <div className="text-center group cursor-pointer">
                  <div className="aspect-square rounded-full overflow-hidden bg-gray-200 mb-3">
                    {artist.image ? <img src={urlFor(artist.image).width(300).height(300).url()} alt={artist.name?.zh} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>}
                  </div>
                  <h3 className="font-medium">{artist.name?.zh || artist.name?.en}</h3>
                  <p className="text-sm text-gray-500">{artist.location}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-6 text-gray-500">No artists yet. Add some in Sanity Studio!</p>
            )}
          </div>
        </div>
      </section>

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
