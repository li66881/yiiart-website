import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TranslatedText, { TranslatedOption } from "@/components/TranslatedText"
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
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-[#181613]">
      <Header />

      <main className="flex-1 pb-20 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Studio roster</p>
            <h1 className="mb-4 text-4xl font-medium tracking-[-0.03em] md:text-5xl">
              <TranslatedText k="artist.ourArtists" />
            </h1>
            <p className="text-stone-600">
              <TranslatedText k="artist.pageDesc" />
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {artists.length > 0 ? (
              artists.map((artist: any) => {
                const artistHref = `/artist/${artist.slug?.current || artist._id}`
                const styles = Array.isArray(artist.style) ? artist.style : []

                return (
                  <Link key={artist._id} href={artistHref} className="group">
                    <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#ebe6dc]">
                      {artist.image ? (
                        <Image
                          src={urlFor(artist.image).width(600).url()}
                          alt={pickEnglish(artist.name, "Artist")}
                          fill
                          sizes="(min-width: 768px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-400">
                          <TranslatedText k="artist.portrait" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-medium">{pickEnglish(artist.name, "YiiArt")}</h3>
                    {artist.location ? <p className="mt-1 text-stone-500">{artist.location}</p> : null}
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                      {pickEnglish(artist.bio, "") || <TranslatedText k="artist.biographyComingSoon" />}
                    </p>
                    {styles.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {styles.map((style: string) => (
                          <span key={style} className="border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600">
                            <TranslatedOption value={style} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </Link>
                )
              })
            ) : (
              <p className="col-span-full text-stone-500">
                <TranslatedText k="home.noArtists" />
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
