import Header from "@/components/Header"
import Footer from "@/components/Footer"
import EditorialHome from "@/components/home/EditorialHome"
import { client, urlFor } from "@/lib/sanity"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { getFeaturedReviews } from "@/lib/reviews"
import { curatedSampleReviews } from "@/lib/sample-reviews"

export const revalidate = 600

const faqs = [
  {
    question: "Is each painting handmade?",
    answer: "Yes. YiiArt focuses on original hand-painted canvas works, not mass-produced poster prints. If a listing ever differs, the product page should state it clearly.",
  },
  {
    question: "Can I customize the size?",
    answer: "Yes. Custom paintings can be planned around your wall size, preferred orientation, room photo, and color direction before production starts.",
  },
  {
    question: "How long does shipping take?",
    answer: "Ready-made works dispatch within 3-5 business days and arrive 5-10 business days later with insured express carriers such as DHL, FedEx, or UPS. Shipping is free worldwide and included in the price.",
  },
  {
    question: "What if the artwork arrives damaged?",
    answer: "Every shipment is insured. Keep the packaging and send photos within 48 hours; YiiArt arranges a free replacement or a full refund.",
  },
]

async function getData() {
  try {
    const [artworks, artistsRaw] = await Promise.all([
      client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc)[0...18]{
      ...,
      artist->{_id, name, location, slug, image}
    }`),
      client.fetch(`*[_type == "artist"] | order(name.en asc, name.zh asc)[0...12]{
        _id,
        name,
        location,
        slug,
        image
      }`),
    ])

    return { artworks, artistsRaw }
  } catch {
    return { artworks: [], artistsRaw: [] }
  }
}

export async function generateMetadata() {
  try {
    const artwork = await client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && (defined(productMedia[approvedForStorefront == true && mediaType == "image"][0].url) || defined(cloudflareImages[0].url) || defined(images[0]))] | order(featured desc, _createdAt desc)[0]{
      title,
      cloudflareImages,
      productMedia,
      images
    }`)
    const image = getArtworkImageUrl(artwork, { width: 1200, height: 630 })

    return buildSeoMetadata({
      title: "Handmade Modern Paintings & Custom Canvas Art",
      description:
        "Shop original handmade modern paintings, large wall art, and custom canvas art for living rooms, bedrooms, offices, and interior design projects.",
      path: "/",
      image,
      imageAlt: artwork ? `${pickEnglish(artwork.title, "Original YiiArt painting")} by YiiArt` : undefined,
    })
  } catch {
    return buildSeoMetadata({
      title: "Handmade Modern Paintings & Custom Canvas Art",
      description:
        "Shop original handmade modern paintings, large wall art, and custom canvas art for living rooms, bedrooms, offices, and interior design projects.",
      path: "/",
    })
  }
}

export default async function Home() {
  const { artworks, artistsRaw } = await getData()
  type FeaturedHomeArtist = {
    id: string
    name: string
    href: string
    location: string | null
    imageUrl: string | null
    role: string
  }

  const artistsFromArtworks = (artworks || [])
    .map((artwork: any) => artwork?.artist)
    .filter(Boolean)

  const artistPool = [...(artistsRaw || []), ...artistsFromArtworks]
  const artistMap = new Map<string, FeaturedHomeArtist>()

  for (const artist of artistPool) {
    const name = pickEnglish(artist.name, "YiiArt Artist")
    if (!name || name === "YiiArt Artist") continue
    const dedupeKey = String(artist._id || name).trim().toLowerCase()
    const portrait = artist.image ? urlFor(artist.image).width(800).height(1000).url() : null
    const artworkFallback = (() => {
      const match = (artworks || []).find((a: any) => a?.artist?._id === artist._id || pickEnglish(a?.artist?.name, "") === name)
      return match ? getArtworkImageUrl(match, { width: 800, height: 1000 }) : null
    })()
    const imageUrl = portrait || artworkFallback || null
    const next: FeaturedHomeArtist = {
      id: String(artist._id || dedupeKey),
      name,
      href: `/artist/${artist.slug?.current || artist._id}`,
      location: artist.location || null,
      imageUrl,
      role: "Painter",
    }
    const prev = artistMap.get(dedupeKey)
    if (!prev || (!prev.imageUrl && next.imageUrl) || (next.location && !prev.location)) {
      artistMap.set(dedupeKey, { ...prev, ...next, imageUrl: next.imageUrl || prev?.imageUrl || null, location: next.location || prev?.location || null })
    }
  }

  const artists = Array.from(artistMap.values())
    .sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)))
    .slice(0, 3)

  const featuredReviews = await getFeaturedReviews(3).catch(() => [])
  const reviews = featuredReviews.length > 0 ? featuredReviews : curatedSampleReviews.slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd([{ name: "Home", path: "/" }])) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }}
      />

      <EditorialHome artworks={artworks} artists={artists} reviews={reviews} />

      <Footer />
    </div>
  )
}
