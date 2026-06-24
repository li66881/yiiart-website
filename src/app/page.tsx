import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroSection from "@/components/HeroSection"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { client } from "@/lib/sanity"
import { formatArtworkDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

const roomLinks = [
  {
    title: "Living Room Art",
    text: "Statement canvas paintings for sofas, open-plan spaces, and calm focal walls.",
    href: "/collections/abstract-art-for-living-room",
  },
  {
    title: "Bedroom Wall Art",
    text: "Softer handmade paintings for bedsides, headboards, guest rooms, and quiet corners.",
    href: "/collections/bedroom-wall-art",
  },
  {
    title: "Dining Room Art",
    text: "Original works with enough presence for dining walls, sideboards, and hosting spaces.",
    href: "/artworks",
  },
  {
    title: "Office Wall Art",
    text: "Modern canvas art for private offices, studios, reception walls, and design projects.",
    href: "/collections/large-canvas-art",
  },
]

const styleLinks = [
  { title: "Abstract Paintings", href: "/artworks?category=Abstract" },
  { title: "Textured Wall Art", href: "/collections/textured-wall-art" },
  { title: "Neutral Wall Art", href: "/collections/neutral-canvas-art" },
  { title: "Black & White Paintings", href: "/artworks?category=Abstract" },
  { title: "Minimalist Art", href: "/artworks?category=Minimalist" },
  { title: "Large Wall Art", href: "/collections/large-canvas-art" },
]

const whyItems = [
  {
    title: "Handmade paintings",
    text: "Each listed work is a physical canvas painting with visible surface, brushwork, and studio handling.",
  },
  {
    title: "Custom sizes and colors",
    text: "Start from your wall measurements, room photos, palette direction, and preferred composition.",
  },
  {
    title: "Secure worldwide shipping",
    text: "Packaging format is selected around artwork size, surface, and shipping safety.",
  },
  {
    title: "Damage protection",
    text: "If damage happens in transit, keep packaging and send photos so YiiArt can review the next step.",
  },
]

const processItems = [
  "Share wall size, room photos, color references, and the mood you want.",
  "YiiArt confirms size, palette, surface direction, shipping format, and timeline.",
  "The studio prepares the painting and can share progress or detail photos when appropriate.",
  "Artwork is packed for the safest available delivery format before dispatch.",
]

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
    answer: "Timing depends on artwork preparation, size, destination, carrier route, and customs. YiiArt confirms available shipping guidance for the specific order before dispatch.",
  },
  {
    question: "What if the artwork arrives damaged?",
    answer: "Keep the artwork and all packaging, then send clear photos as soon as possible. YiiArt will review the case and guide the damage support process.",
  },
]

async function getData() {
  try {
    const artworks = await client.fetch(`*[_type == "artwork"] | order(featured desc, _createdAt desc)[0...18]{
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
    const artwork = await client.fetch(`*[_type == "artwork" && (defined(cloudflareImages[0].url) || defined(images[0]))] | order(featured desc, _createdAt desc)[0]{
      title,
      cloudflareImages,
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
  const heroArtwork = artworks.find(hasArtworkImage)
  const heroImage = getArtworkImageUrl(heroArtwork, { width: 1800, height: 1200 })
  const bestSellerArtworks = artworks.slice(0, 8)

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

      <HeroSection
        imageUrl={heroImage}
        imageAlt={heroArtwork ? `${pickEnglish(heroArtwork.title, "Original YiiArt artwork")} in an interior art setting` : undefined}
      />

      <main className="flex-1">
        <ShopByRoomSection />
        <ShopByStyleSection />
        <BestSellersSection artworks={bestSellerArtworks} />
        <WhyYiiArtSection />
        <CustomPaintingSection />
        <StudioProcessSection />
        <FaqSection />
      </main>

      <Footer />
    </div>
  )
}

function ShopByRoomSection() {
  return (
    <section className="border-b border-stone-200 bg-white py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionIntro
          eyebrow="Shop by Room"
          title="Choose art for the room you are finishing"
          text="Start with the wall, furniture scale, natural light, and mood of the space before choosing the painting."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roomLinks.map((item) => (
            <Link key={item.title} href={item.href} className="group border border-stone-200 bg-[#fbfaf6] p-6 transition hover:border-black hover:bg-white">
              <p className="text-sm uppercase text-stone-500">Room</p>
              <h3 className="mt-12 text-2xl font-light group-hover:underline group-hover:underline-offset-4">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-stone-600">{item.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ShopByStyleSection() {
  return (
    <section className="border-b border-stone-200 py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionIntro
          eyebrow="Shop by Style"
          title="Modern decorative paintings by surface, palette, and scale"
          text="Browse the paths collectors most often use when choosing canvas art for a real interior."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {styleLinks.map((item) => (
            <Link key={item.title} href={item.href} className="flex min-h-24 items-center justify-between border border-stone-200 bg-white px-5 py-4 transition hover:border-black">
              <span className="text-xl font-light">{item.title}</span>
              <span className="text-sm text-stone-400">View</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function BestSellersSection({ artworks }: { artworks: any[] }) {
  return (
    <section id="best-sellers" className="border-b border-stone-200 bg-white py-20 scroll-mt-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionIntro
            eyebrow="Best Sellers"
            title="Collector-ready paintings for modern homes"
            text="This area uses the current artwork data in the store. When sales ranking data is connected, this section can be sorted by real order performance."
            compact
          />
          <Link href="/artworks" className="text-sm underline underline-offset-4">
            View all artworks
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {artworks.length > 0 ? artworks.map((artwork: any) => (
            <ArtworkCard key={artwork._id} artwork={artwork} />
          )) : (
            <div className="col-span-full border-y border-stone-200 bg-[#fbfaf6] py-20 text-center">
              <p className="text-stone-500">Best seller artworks will appear here when product data is available.</p>
            </div>
          )}
        </div>

        {artworks.length > 0 && (
          <p className="mt-8 text-center text-xs text-stone-500">
            <PriceDisclosure />
          </p>
        )}
      </div>
    </section>
  )
}

function WhyYiiArtSection() {
  return (
    <section className="border-b border-stone-200 py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionIntro
          eyebrow="Why YiiArt"
          title="A clearer way to buy handmade canvas art online"
          text="YiiArt keeps the decision practical: real artwork details, custom sizing support, secure shipping, and help before purchase."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {whyItems.map((item, index) => (
            <div key={item.title} className="border-t border-stone-300 pt-5">
              <p className="text-sm text-stone-400">0{index + 1}</p>
              <h3 className="mt-5 text-xl font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomPaintingSection() {
  return (
    <section className="border-b border-stone-200 bg-stone-950 text-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-10">
        <div>
          <p className="mb-3 text-sm uppercase text-white/60">Custom Painting Service</p>
          <h2 className="text-4xl font-light leading-tight md:text-5xl">Commission a canvas painting for your exact wall.</h2>
        </div>
        <div>
          <p className="max-w-3xl text-base leading-8 text-white/72">
            Send your wall measurements, room photo, preferred palette, and inspiration direction. YiiArt can help confirm
            the size, style, shipping format, and production scope before you place a custom order.
          </p>
          <Link href="/custom-painting" className="mt-8 inline-flex bg-white px-6 py-4 text-sm font-medium text-black transition hover:bg-stone-100">
            Start a Custom Order
          </Link>
        </div>
      </div>
    </section>
  )
}

function StudioProcessSection() {
  return (
    <section className="border-b border-stone-200 bg-[#f3efe6] py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="mb-3 text-sm uppercase text-stone-500">Customer Photos / Studio Process</p>
            <h2 className="text-4xl font-light leading-tight">Real customer photos will appear when verified.</h2>
          </div>
          <p className="max-w-3xl text-base leading-8 text-stone-600">
            Until verified customer room photos are available, YiiArt shows the studio process instead of inventing
            reviews or lifestyle images. This keeps the store honest while still explaining how custom and ready-made
            paintings are prepared.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processItems.map((item, index) => (
            <div key={item} className="border border-stone-300 bg-[#fbfaf6] p-5">
              <p className="text-sm text-stone-400">Step 0{index + 1}</p>
              <p className="mt-8 text-sm leading-6 text-stone-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1fr] lg:px-10">
        <div>
          <p className="mb-3 text-sm uppercase text-stone-500">FAQ</p>
          <h2 className="text-4xl font-light leading-tight">Questions before buying original art</h2>
        </div>
        <div className="border-y border-stone-200">
          {faqs.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                {item.question}
                <span className="text-stone-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionIntro({
  eyebrow,
  title,
  text,
  compact = false,
}: {
  eyebrow: string
  title: string
  text: string
  compact?: boolean
}) {
  return (
    <div className={compact ? "" : "mb-10 max-w-3xl"}>
      <p className="mb-3 text-sm uppercase text-stone-500">{eyebrow}</p>
      <h2 className="text-4xl font-light leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">{text}</p>
    </div>
  )
}

function ArtworkCard({ artwork }: { artwork: any }) {
  const href = `/artwork/${artwork.slug?.current || artwork._id}`
  const image = getArtworkImageUrl(artwork, { width: 700, height: 900 })
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const category = normalizeCategory(artwork.category)
  const medium = normalizeMedium(artwork.medium)

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        {image ? (
          <img
            src={image}
            alt={`${title}, handmade modern canvas art`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-stone-200 bg-[#fbfaf6] text-stone-400">
            Artwork image coming soon
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/72 px-4 py-3 text-sm text-white opacity-0 transition group-hover:opacity-100">
          <span>{formatArtworkDimensions(artwork)}</span>
          <span>View artwork</span>
        </div>
      </div>
      <div className="pt-4">
        <p className="text-xs uppercase text-stone-500">
          {[category, medium].filter(Boolean).join(" / ")}
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium leading-snug">{title}</h3>
            <p className="mt-1 text-sm text-stone-500">{pickEnglish(artwork.artist?.name, "YiiArt")}</p>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold">
            <PriceText amountCny={artwork.price} />
          </p>
        </div>
      </div>
    </Link>
  )
}
