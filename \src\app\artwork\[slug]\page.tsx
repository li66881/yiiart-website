import { client, urlFor } from '@/lib/sanity'
import Link from 'next/link'

async function getArtwork(slug: string) {
  return client.fetch(`*[_type == "artwork" && slug.current == $slug][0]`, { slug })
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artwork = await getArtwork(slug)

  if (!artwork) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Artwork not found</h1>
        <Link href="/artworks" className="text-gray-500 hover:text-black">← Back to Artworks</Link>
      </div>
    </div>
  )

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
          <Link href="/artworks" className="text-gray-500 hover:text-black mb-8 inline-block">← Back to Artworks</Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-4">
            {/* Images */}
            <div>
              {artwork.images?.[0] && (
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img src={urlFor(artwork.images[0]).width(1200).url()} alt={artwork.title?.zh} className="w-full h-full object-contain" />
                </div>
              )}
              {artwork.images?.length > 1 && (
                <div className="flex gap-4 mt-4">
                  {artwork.images.slice(1).map((img: any, i: number) => (
                    <div key={i} className="w-24 h-24 bg-gray-100">
                      <img src={urlFor(img).width(200).url()} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Info */}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">{artwork.category} · {artwork.medium}</p>
              <h1 className="text-4xl font-light mb-2">{artwork.title?.zh || artwork.title?.en}</h1>
              <p className="text-xl text-gray-500 mb-6">{artwork.artist?.name?.zh}</p>
              <p className="text-3xl font-semibold mb-6">¥{artwork.price?.toLocaleString()}</p>
              
              <div className="space-y-3 text-gray-600 mb-8">
                <p>Dimensions: {artwork.dimensions}</p>
                <p>Medium: {artwork.medium}</p>
                <p>Category: {artwork.category}</p>
              </div>
              
              {artwork.description?.zh && (
                <div className="border-t pt-8">
                  <h2 className="text-lg font-medium mb-4">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">{artwork.description.zh}</p>
                </div>
              )}
              
              <div className="mt-8 space-y-4">
                <button className="w-full py-4 bg-black text-white hover:bg-gray-800 transition">Add to Cart</button>
                <button className="w-full py-4 border border-black hover:bg-black hover:text-white transition">Contact Artist</button>
              </div>
            </div>
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
