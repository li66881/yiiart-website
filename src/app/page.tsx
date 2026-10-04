import Header from "@/components/Header"
import Footer from "@/components/Footer"
import EditorialHome from "@/components/home/EditorialHome"
import { client } from "@/lib/sanity"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl } from "@/lib/artwork-images"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"

export const revalidate = 600

async function getData() {
  try {
    const artworks = await client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(_createdAt desc){
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
      title: "Hand-Painted Art for Interior Design Projects & Homes",
      description:
        "Explore hand-painted artwork for interior design projects and homes. Discuss coordinated selections, custom sizes, palettes, and made-to-order canvas art with YiiArt.",
      path: "/",
      image,
      imageAlt: artwork ? `${pickEnglish(artwork.title, "Original YiiArt painting")} by YiiArt` : undefined,
    })
  } catch {
    return buildSeoMetadata({
      title: "Hand-Painted Art for Interior Design Projects & Homes",
      description:
        "Explore hand-painted artwork for interior design projects and homes. Discuss coordinated selections, custom sizes, palettes, and made-to-order canvas art with YiiArt.",
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
      <EditorialHome artworks={artworks} />

      <Footer />
    </div>
  )
}
