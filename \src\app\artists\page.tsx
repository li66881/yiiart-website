import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'

async function getArtists() {
  return client.fetch(`*[_type == "artist"] | order(name.zh asc)`)
}

export default async function ArtistsPage() {
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

      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-light mb-4">Our Artists</h1>
          <p className="text-gray-500 mb-12">Meet the talented artists behind YiiArt</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {artists.length > 0 ? artists.map((artist: any) => (
              <Link key={artist._id} href={`/artist/${artist.slug.current}`}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                    {artist.image ? <img src={urlFor(artist.image).width(600).url()} alt={artist.name?.zh} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">👤</div>}
                  </div>
                  <h3 className="text-xl font-medium">{artist.name?.zh || artist.name?.en}</h3>
                  <p className="text-gray-500">{artist.location}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {artist.style?.map((s: string) => <span key={s} className="text-xs px-2 py-1 bg-gray-100">{s}</span>)}
                  </div>
                </div>
              </Link>
            )) : (
              <p className="col-span-3 text-gray-500">No artists yet. Add some in Sanity Studio!</p>
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
