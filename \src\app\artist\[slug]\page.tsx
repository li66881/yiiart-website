import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'

async function getArtist(slug: string) {
  return client.fetch(`*[_type == "artist" && slug.current == $slug][0]`, { slug })
}

async function getArtistArtworks(artistId: string) {
  return client.fetch(`*[_type == "artwork" && artist._ref == $artistId]`, { artistId })
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = await getArtist(slug)
  
  if (!artist) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Artist not found</h1>
        <Link href="/artists" className="text-gray-500 hover:text-black">← Back to Artists</Link>
      </div>
    </div>
  )
  
  const artworks = await getArtistArtworks(artist._id)

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
        <div className="container mx-auto px-4 py-12">
          <Link href="/artists" className="text-gray-500 hover:text-black mb-8 inline-block">← Back to Artists</Link>
          
          <div className="flex flex-col md:flex-row gap-12 items-start mt-4">
            <div className="w-64 flex-shrink-0">
              {artist.image ? (
                <img src={urlFor(artist.image).width(400).url()} alt={artist.name?.zh} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-6xl text-gray-300">👤</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-light mb-2">{artist.name?.zh || artist.name?.en}</h1>
              <p className="text-xl text-gray-500 mb-4">{artist.location}</p>
              <div className="flex gap-2 mb-6 flex-wrap">
                {artist.style?.map((s: string) => <span key={s} className="text-sm px-3 py-1 bg-gray-100">{s}</span>)}
              </div>
              {artist.bio?.zh && (
                <div className="border-t pt-8">
                  <h2 className="text-lg font-medium mb-4">Biography</h2>
                  <p className="text-gray-600 whitespace-pre-line">{artist.bio.zh}</p>
                </div>
              )}
            </div>
          </div>

          {/* Artist's Artworks */}
          {artworks.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-light mb-8">Works by {artist.name?.zh}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {artworks.map((artwork: any) => (
                  <Link key={artwork._id} href={`/artwork/${artwork.slug.current}`}>
                    <div className="group cursor-pointer">
                      <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                        {artwork.images?.[0] && <img src={urlFor(artwork.images[0]).width(600).url()} alt={artwork.title?.zh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <h3 className="font-medium">{artwork.title?.zh || artwork.title?.en}</h3>
                      <p className="text-sm text-gray-500">{artwork.dimensions}</p>
                      <p className="mt-1">¥{artwork.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
