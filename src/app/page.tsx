import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'

async function getData() {
  const artworks = await client.fetch(`*[_type == "artwork" && featured == true][0...6]`)
  const artists = await client.fetch(`*[_type == "artist"][0...6]`)
  return { artworks, artists }
}

export default async function Home() {
  const { artworks, artists } = await getData()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center mt-16">
        <img 
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-light mb-6">
            Choose a scene first,<br /><em>then choose art</em>
          </h1>
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
      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light mb-8">Featured Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.length > 0 ? artworks.map((artwork: any) => (
              <Link key={artwork._id} href={`/artwork/${artwork.slug?.current || artwork._id}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    {artwork.images?.[0] && <img src={urlFor(artwork.images[0]).width(600).url()} alt={artwork.title?.zh || 'Artwork'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <h3 className="font-medium">{artwork.title?.zh || artwork.title?.en || 'Untitled'}</h3>
                  <p className="text-gray-500 text-sm">{artwork.artist?.name?.zh || artwork.artist?.name?.en}</p>
                  <p className="mt-1">¥{artwork.price?.toLocaleString()}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-3 text-gray-500 text-center py-20">No featured artworks yet. Add some in Sanity Studio!</p>
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
              <Link key={artist._id} href={`/artist/${artist.slug?.current || artist._id}`}>
                <div className="text-center group cursor-pointer">
                  <div className="aspect-square rounded-full overflow-hidden bg-gray-200 mb-3">
                    {artist.image ? <img src={urlFor(artist.image).width(300).height(300).url()} alt={artist.name?.zh || 'Artist'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>}
                  </div>
                  <h3 className="font-medium">{artist.name?.zh || artist.name?.en || 'Artist'}</h3>
                  <p className="text-sm text-gray-500">{artist.location}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-6 text-gray-500 text-center py-20">No artists yet. Add some in Sanity Studio!</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
