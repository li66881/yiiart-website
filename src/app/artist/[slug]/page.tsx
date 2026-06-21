import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { PriceText } from "@/components/PriceText"
import TranslatedText, { TranslatedOption, TranslatedOptionList, TranslatedTemplate } from "@/components/TranslatedText"
import { client, urlFor } from "@/lib/sanity"
import { formatDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"

export const revalidate = 600

async function getArtist(slug: string) {
  try {
    return await client.fetch(`*[_type == "artist" && (slug.current == $slug || _id == $slug)][0]`, { slug })
  } catch (error) {
    console.error("Artist fetch error:", error)
    return null
  }
}

async function getArtistArtworks(artistId: string) {
  try {
    return await client.fetch(
      `*[_type == "artwork" && artist._ref == $artistId] | order(_createdAt desc)`,
      { artistId }
    )
  } catch (error) {
    console.error("Artist artworks fetch error:", error)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = await getArtist(slug)

  if (!artist) {
    return buildSeoMetadata({
      title: "Artist Not Found",
      description: "This YiiArt artist profile could not be found.",
      path: `/artist/${slug}`,
      robots: { index: false, follow: true },
    })
  }

  const artistName = pickEnglish(artist.name, "YiiArt")
  const image = artist.image ? urlFor(artist.image).width(1200).height(630).url() : undefined

  return buildSeoMetadata({
    title: `${artistName} Artist Profile`,
    description: pickEnglish(
      artist.bio,
      `View available original paintings by ${artistName}, with artist details, worldwide delivery, and YiiArt collector support.`
    ),
    path: `/artist/${slug}`,
    image,
    imageAlt: artistName,
  })
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
            <h1 className="mb-4 text-2xl"><TranslatedText k="artist.notFound" /></h1>
            <Link href="/artists" className="text-gray-500 hover:text-black"><TranslatedText k="artist.backToArtists" /></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const artworks = await getArtistArtworks(artist._id)
  const artistName = pickEnglish(artist.name, "YiiArt")
  const styles = Array.isArray(artist.style) ? artist.style : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 py-12">
          <Link href="/artists" className="mb-8 inline-block text-gray-500 hover:text-black">
            <TranslatedText k="artist.backToArtists" />
          </Link>

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
                  <TranslatedText k="artist.portrait" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-light">{artistName}</h1>
              <p className="mb-4 text-xl text-gray-500">{artist.location}</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {styles.map((style: string) => (
                  <span key={style} className="bg-gray-100 px-3 py-1 text-sm"><TranslatedOption value={style} /></span>
                ))}
              </div>
              <div className="border-t pt-8">
                <h2 className="mb-4 text-lg font-medium"><TranslatedText k="artist.biography" /></h2>
                <p className="whitespace-pre-line text-gray-600">
                  {pickEnglish(artist.bio, "") || <TranslatedText k="artist.biographyComingSoon" />}
                </p>
              </div>
            </div>
          </div>

          {artworks.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-8 text-2xl font-light">
                <TranslatedTemplate k="artist.worksBy" values={{ artistName }} />
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {artworks.map((artwork: any) => (
                  <Link key={artwork._id} href={`/artwork/${artwork.slug?.current || artwork._id}`}>
                    <div className="group cursor-pointer">
                      <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
                        {getArtworkImageUrl(artwork, { width: 600 }) && (
                          <img
                            src={getArtworkImageUrl(artwork, { width: 600 })}
                            alt={pickEnglish(artwork.title, "Artwork")}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        <TranslatedOptionList
                          values={[normalizeCategory(artwork.category), normalizeMedium(artwork.medium)]}
                          separator=" / "
                        />
                      </p>
                      <h3 className="mt-1 font-medium">{pickEnglish(artwork.title, "Untitled artwork")}</h3>
                      <p className="text-sm text-gray-500">{formatDimensions(artwork.dimensions)}</p>
                      <p className="mt-1 font-semibold"><PriceText amountCny={artwork.price} /></p>
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
