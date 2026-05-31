import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { client, urlFor } from "@/lib/sanity"
import { pickEnglish } from "@/lib/artwork-display"
import { buildSeoMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

export const metadata = buildSeoMetadata({
  title: "Independent Chinese Artists",
  description:
    "Meet the artists behind YiiArt's original paintings and browse available works by abstract, landscape, textured, and minimalist painters.",
  path: "/artists",
})

async function getArtists() {
  try {
    return await client.fetch(`*[_type == "artist"] | order(name.en asc, name.zh asc)`)
  } catch {
    return []
  }
}

export default async function ArtistsPage() {
  const artists = await getArtists()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-2xl">
            <h1 className="text-4xl font-light mb-4">Our Artists</h1>
            <p className="text-gray-500">
              Meet the artists behind YiiArt and explore the works currently available for collectors.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {artists.length > 0 ? artists.map((artist: any) => (
              <Link key={artist._id} href={`/artist/${artist.slug.current}`}>
                <div className="group cursor-pointer">
                  <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                    {artist.image ? (
                      <img
                        src={urlFor(artist.image).width(600).url()}
                        alt={pickEnglish(artist.name, "Artist")}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">Artist portrait</div>
                    )}
                  </div>
                  <h3 className="text-xl font-medium">{pickEnglish(artist.name, "YiiArt artist")}</h3>
                  <p className="text-gray-500">{artist.location}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600">{pickEnglish(artist.bio, "Biography coming soon.")}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {artist.style?.map((style: string) => (
                      <span key={style} className="bg-gray-100 px-2 py-1 text-xs">{style}</span>
                    ))}
                  </div>
                </div>
              </Link>
            )) : (
              <p className="col-span-full text-gray-500">Artist profiles are being prepared.</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
