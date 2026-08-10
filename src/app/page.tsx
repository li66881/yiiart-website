import Header from "@/components/Header"
import Footer from "@/components/Footer"
import EditorialHome from "@/components/home/EditorialHome"
import { client } from "@/lib/sanity"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"

export const revalidate = 600

const faqs = [
  {
    question: "Is each painting handmade?",
    answer: "Physical hand-painted artwork, not a printed reproduction. Each listed design is recreated by studio artists, with natural variations in brushwork and color.",
  },
  {
    question: "Can I customize the size?",
    answer: "Yes. Custom paintings can be planned around your wall size, preferred orientation, room photo, and color direction before production starts.",
  },
  {
    question: "How long does shipping take?",
    answer: "Delivery timing and format are confirmed by destination, size, finish, and carrier route. Tracking information is shared when the selected carrier service provides it.",
  },
  {
    question: "What if the artwork arrives damaged?",
    answer: "Keep the artwork and all packaging and send clear photos so YiiArt can review the issue and available carrier process.",
  },
]

async function getData() {
  try {
    const artworks = await client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc)[0...18]{
      ...,
      artist->{name}
    }`)

    return { artworks }
  } catch {
    return { artworks: [] }
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
  const { artworks } = await getData()

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

      <EditorialHome artworks={artworks} />

      <Footer />
    </div>
  )
}
