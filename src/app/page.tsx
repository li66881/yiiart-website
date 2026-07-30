import Header from "@/components/Header"
import Footer from "@/components/Footer"
import EditorialHome from "@/components/home/EditorialHome"
import { client, urlFor } from "@/lib/sanity"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"

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
      artist->{name}
    }`),
      client.fetch(`*[_type == "artist"] | order(name.en asc, name.zh asc)[0...6]{
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
  const artists = Array.from(
    new Map(
      (artistsRaw || []).map((artist: any) => {
        const id = String(artist._id)
        return [
          id,
          {
            id,
            name: pickEnglish(artist.name, "YiiArt Artist"),
            href: `/artist/${artist.slug?.current || artist._id}`,
            location: artist.location || null,
            imageUrl: artist.image ? urlFor(artist.image).width(800).height(1000).url() : null,
            role: "Painter",
          },
        ] as const
      }),
    ).values(),
  ).slice(0, 3) as Array<{
    id: string
    name: string
    href: string
    location: string | null
    imageUrl: string | null
    role: string
  }>

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

      <EditorialHome artworks={artworks} artists={artists} />

      <Footer />
    </div>
  )
}
