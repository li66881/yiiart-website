import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { client, urlFor } from "@/lib/sanity"
import { formatDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { formatStorePrice } from "@/lib/pricing"

export const dynamic = "force-dynamic"

async function getArtist(slug: string) {
  return client.fetch(`*[_type == "artist" && slug.current == $slug][0]`, { slug })
}

async function getArtistArtworks(artistId: string) {
  return client.fetch(
    `*[_type == "artwork" && artist._ref == $artistId] | order(_createdAt desc)`,
    { artistId }
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const artist = await getArtist(slug)
  if (!artist) {
    return { title: "Artist not found" }
  }
  const name = pickEnglish(artist.name, "YiiArt artist")
  return {
    title: name + " | YiiArt",
    description: artist.location ? name + " - " + artist.location : name,
    openGraph: {
      title: name + " | YiiArt",
      description: artist.location ? name + " - " + artist.location : name,
    },
  }
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = await getArtist(slug)

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="mb-4 text-2xl">Artist not found</h1>
            <Link href="/artists" className="text-gray-500 hover:text-black">Back to artists</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const artworks = await getArtistArtworks(artist._id)
  const artistName = pickEnglish(artist.name, "YiiArt artist")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 py-12">
          <Link href="/artists" className="mb-8 inline-block text-gray-500 hover:text-black">Back to artists</Link>

          <div className="mt-4 flex flex-col items-start gap-12 md:flex-row">
            <div className="w-64 flex-shrink-0">
              {artist.image ? (
                <img
                  src={urlFor(artist.image).width(500).height(500).url()}
                  alt={artistName}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-300">
                  Artist portrait
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-light">{artistName}</h1>
              <p className="mb-4 text-xl text-gray-500">{artist.location}</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {artist.style?.map((style: string) => (
                  <span key={style} className="bg-gray-100 px-3 py-1 text-sm">{style}</span>
                ))}
              </div>
              <div className="border-t pt-8">
                <h2 className="mb-4 text-lg font-medium">Biography</h2>
                <p className="whitespace-pre-line text-gray-600">
                  {pickEnglish(artist.bio, "Biography coming soon.")}
                </p>
              </div>
            </div>
          </div>

          {artworks.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-8 text-2xl font-light">Works by {artistName}</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {artworks.map((artwork: any) => (
                  <Link key={artwork._id} href={`/artwork/${artwork.slug.current}`}>
                    <div className="group cursor-pointer">
                      <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                        {artwork.images?.[0] && (
                          <img
                            src={urlFor(artwork.images[0]).width(600).url()}
                            alt={pickEnglish(artwork.title, "Artwork")}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        {[normalizeCategory(artwork.category), normalizeMedium(artwork.medium)].filter(Boolean).join(" / ")}
                      </p>
                      <h3 className="mt-1 font-medium">{pickEnglish(artwork.title, "Untitled artwork")}</h3>
                      <p className="text-sm text-gray-500">{formatDimensions(artwork.dimensions)}</p>
                      <p className="mt-1 font-semibold">{formatStorePrice(artwork.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
