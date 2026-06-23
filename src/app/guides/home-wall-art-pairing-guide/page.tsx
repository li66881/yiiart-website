import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { absoluteUrl, buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from "@/lib/seo"

const pagePath = "/guides/home-wall-art-pairing-guide"
const title = "Original Wall Art Pairing Guide for Modern Homes"
const description =
  "Learn how to choose original hand-painted wall art for living rooms, bedrooms, dining rooms, entryways, offices, and custom canvas projects."

export const metadata: Metadata = buildSeoMetadata({
  title,
  description,
  path: pagePath,
})

const roomGuides = [
  {
    title: "Living Room Wall Art",
    text: "Start with the sofa wall or the main seating area. A single large canvas usually feels calmer than several small pieces when the room needs one clear focal point.",
    link: "/collections/abstract-art-for-living-room",
    label: "Shop living room art",
  },
  {
    title: "Bedroom Wall Art",
    text: "Bedrooms work best with softer movement, quieter contrast, and a size that relates to the headboard without crowding lamps or ceiling lines.",
    link: "/collections/bedroom-wall-art",
    label: "Shop bedroom art",
  },
  {
    title: "Dining Room Art",
    text: "A dining wall can take stronger color or a wider horizontal composition, especially when the artwork sits above a sideboard or long table.",
    link: "/artworks",
    label: "Browse artworks",
  },
  {
    title: "Office and Hospitality Art",
    text: "Offices, studios, hotels, and reception walls often need larger works with enough presence from across the room and a professional, settled palette.",
    link: "/collections/large-canvas-art",
    label: "View large canvas art",
  },
]

const sizeRules = [
  {
    title: "Above a sofa",
    text: "A practical starting point is artwork around 60%-75% of the sofa width, adjusted for ceiling height and side furniture.",
  },
  {
    title: "Above a bed",
    text: "Choose a painting slightly narrower than the headboard, with enough empty wall around the edges for the room to breathe.",
  },
  {
    title: "Large feature walls",
    text: "If the wall is open and visible from a distance, size up. Small pieces can look disconnected on wide modern walls.",
  },
  {
    title: "Narrow entries",
    text: "Use vertical or medium-sized works that can be appreciated close up, especially textured paintings with surface detail.",
  },
]

const styleGuides = [
  {
    title: "Textured wall art",
    text: "Use texture when the room needs depth without relying on bright color. Ask for detail photos if surface thickness matters.",
    href: "/collections/textured-wall-art",
  },
  {
    title: "Neutral canvas art",
    text: "Neutral paintings work well with stone, wood, linen, plaster, and simple furniture, but undertone still matters.",
    href: "/collections/neutral-canvas-art",
  },
  {
    title: "Large canvas art",
    text: "Large original paintings are strongest above sofas, beds, console walls, offices, studios, and hospitality feature walls.",
    href: "/collections/large-canvas-art",
  },
  {
    title: "Custom canvas painting",
    text: "Custom work is the best path when your wall needs a precise size, orientation, color mood, or matching set.",
    href: "/custom-painting",
  },
]

const mistakes = [
  "Choosing art that is too small for the furniture below it.",
  "Ignoring the room's undertone, especially warm beige, cool gray, cream, taupe, or wood tones.",
  "Hanging the center of the artwork far above eye level.",
  "Buying only from a product photo without checking dimensions, surface detail, and room scale.",
  "Forgetting shipping format for oversized canvas art before checkout.",
]

const faqs = [
  {
    question: "What size wall art should I choose for a living room?",
    answer:
      "For artwork above a sofa, a helpful starting point is about 60%-75% of the sofa width. The final choice should also consider ceiling height, side tables, lamps, and how far away the artwork is viewed.",
  },
  {
    question: "Is original wall art better than prints?",
    answer:
      "Original hand-painted art offers real surface, brushwork, texture, and one-of-a-kind character. Prints can be decorative, but they do not have the same physical depth or studio-made object quality.",
  },
  {
    question: "Can YiiArt help match a painting to my room?",
    answer:
      "Yes. You can send wall width, ceiling height, furniture size, room photos, and color direction. YiiArt can help compare a ready-made painting with a custom canvas option.",
  },
  {
    question: "Can I request a custom size or color palette?",
    answer:
      "Yes. Custom canvas paintings can be planned around your exact wall size, preferred orientation, room palette, and style direction before production begins.",
  },
  {
    question: "What should I check before buying large canvas art online?",
    answer:
      "Check dimensions, orientation, medium, close-up texture photos, shipping format, return terms, and whether the artwork will be shipped stretched, flat, or rolled for safety.",
  },
]

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  datePublished: "2026-06-24",
  dateModified: "2026-06-24",
  author: {
    "@type": "Organization",
    name: "YiiArt",
  },
  publisher: {
    "@type": "Organization",
    name: "YiiArt",
  },
  mainEntityOfPage: absoluteUrl(pagePath),
  image: absoluteUrl("/og-image"),
}

export default function HomeWallArtPairingGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: title, path: pagePath },
          ])),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <Link href="/guides" className="mb-8 inline-block text-sm text-stone-500 hover:text-black">
                Back to guides
              </Link>
              <p className="mb-3 text-sm uppercase tracking-wider text-stone-500">Wall Art Guide</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">{title}</h1>
            </div>
            <div>
              <p className="max-w-3xl text-base leading-8 text-stone-600">
                Choosing original wall art is not only about filling blank space. The right hand-painted canvas should
                fit the room's scale, color temperature, furniture, natural light, and the feeling you want to live with
                every day.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/artworks" className="bg-black px-6 py-4 text-center text-sm text-white transition hover:bg-stone-800">
                  Browse original paintings
                </Link>
                <Link href="/custom-painting" className="border border-stone-300 px-6 py-4 text-center text-sm transition hover:border-black">
                  Request custom canvas
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-5 text-sm leading-6 text-stone-600 md:grid-cols-4">
            <p className="border-l border-stone-300 pl-4">Best for U.S. and European homes, apartments, studios, offices, and hospitality interiors.</p>
            <p className="border-l border-stone-300 pl-4">Focuses on original hand-painted canvas art, not mass-produced poster prints.</p>
            <p className="border-l border-stone-300 pl-4">Covers size, color, texture, framing direction, shipping format, and custom painting decisions.</p>
            <p className="border-l border-stone-300 pl-4">Useful before choosing living room art, bedroom wall art, large canvas art, or neutral wall art.</p>
          </div>
        </section>

        <ArticleSection eyebrow="Why Original Art" title="Original wall art changes the room differently than a print.">
          <p>
            A print can add color, but an original painting adds object quality. Real paint catches light differently
            through the day. Brushwork, texture, small surface variations, and the artist's hand give the piece a
            presence that flat reproduction cannot fully copy.
          </p>
          <p>
            This matters most in modern interiors, where furniture lines are often simple and walls are large. A
            hand-painted canvas can become the quiet center of the room without making the space feel overdecorated.
            For YiiArt buyers, the goal is usually not just "wall decor." It is a finished room with scale, balance,
            material depth, and a piece that feels personal enough to keep.
          </p>
        </ArticleSection>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              eyebrow="By Room"
              title="Choose the painting around how the room is used."
              text="Each room has a different visual job. A living room may need a focal point, while a bedroom usually needs calm. Start there before choosing style."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {roomGuides.map((item) => (
                <Link key={item.title} href={item.link} className="group border border-stone-200 bg-white p-6 transition hover:border-black">
                  <p className="text-sm uppercase text-stone-500">Room</p>
                  <h2 className="mt-10 text-2xl font-light group-hover:underline group-hover:underline-offset-4">{item.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-stone-600">{item.text}</p>
                  <p className="mt-6 text-sm text-stone-400">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ArticleSection eyebrow="Size and Scale" title="Measure furniture first, then choose the artwork.">
          <p>
            The most common online art mistake is buying a painting that looks strong in a product photo but too small
            on the wall. Before choosing, measure the furniture below the artwork, the open wall width, the ceiling
            height, and the viewing distance from the main seat or doorway.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sizeRules.map((item) => (
              <div key={item.title} className="border-t border-stone-300 pt-5">
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
              </div>
            ))}
          </div>
          <p>
            If the room is difficult to judge from measurements alone, tape paper to the wall in the proposed size and
            photograph it from the main viewing angle. YiiArt can review room photos, wall width, ceiling height, and
            furniture dimensions before you decide between a ready-made artwork and a custom canvas painting.
          </p>
        </ArticleSection>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              eyebrow="Style Paths"
              title="Match the surface, palette, and scale to the interior."
              text="The strongest SEO and buyer path for YiiArt is room plus style plus size. These are the choices real buyers make before purchase."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {styleGuides.map((item) => (
                <Link key={item.title} href={item.href} className="border border-stone-200 bg-[#fbfaf6] p-6 transition hover:border-black hover:bg-white">
                  <h2 className="text-2xl font-light">{item.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-stone-600">{item.text}</p>
                  <p className="mt-6 text-sm text-stone-400">View collection</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ArticleSection eyebrow="Color Matching" title="Look at undertone before you look at color names.">
          <p>
            A painting described as beige, gray, white, blue, or brown can still feel warm, cool, earthy, creamy, muted,
            or bright depending on the light and surrounding materials. In rooms with stone, wood, linen, leather, or
            painted cabinetry, undertone is often more important than the general color family.
          </p>
          <p>
            For neutral rooms, the artwork can introduce the accent color. For already colorful rooms, the artwork can
            repeat one existing tone and add surface depth instead of more visual noise. When color accuracy matters,
            request daylight photos, side-detail images, and a comparison with your wall or sofa photo before purchase.
          </p>
        </ArticleSection>

        <ArticleSection eyebrow="Framing and Shipping" title="Confirm presentation and delivery before checkout.">
          <p>
            Framing should support the painting rather than compete with it. Natural wood suits Scandinavian, organic,
            and rustic rooms. Black or dark frames feel cleaner in modern and industrial spaces. White frames can make a
            light room feel airy. Some canvases are strongest unframed, especially when the surface already has enough
            presence.
          </p>
          <p>
            Large canvas art needs one extra check: shipping format. Depending on size, surface, and destination, a work
            may ship stretched, flat, or rolled for safer international delivery. Ask before ordering if the final
            display format matters to your wall plan.
          </p>
        </ArticleSection>

        <section className="border-b border-stone-200 bg-stone-950 px-4 py-16 text-white sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm uppercase text-white/60">Custom Painting</p>
              <h2 className="text-4xl font-light leading-tight">When the wall is specific, custom canvas art is often the better answer.</h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-white/70">
                Send wall width, ceiling height, room photos, preferred colors, style direction, shipping country, and
                budget range. YiiArt can help decide whether an available original works as-is or whether a custom
                painting should be planned around the room.
              </p>
            </div>
            <div className="grid gap-3">
              <Link href="/custom-painting" className="bg-white px-6 py-4 text-center text-sm text-black transition hover:bg-stone-100">
                Start custom painting
              </Link>
              <Link href="/size-guide" className="border border-white/35 px-6 py-4 text-center text-sm transition hover:bg-white hover:text-black">
                Read size guide
              </Link>
            </div>
          </div>
        </section>

        <ArticleSection eyebrow="Mistakes to Avoid" title="A few practical checks prevent expensive mismatches.">
          <ul className="mt-6 grid gap-3 text-sm leading-6 text-stone-600 md:grid-cols-2">
            {mistakes.map((item) => (
              <li key={item} className="border-l border-stone-300 pl-4">
                {item}
              </li>
            ))}
          </ul>
        </ArticleSection>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="mb-3 text-sm uppercase text-stone-500">FAQ</p>
              <h2 className="text-4xl font-light leading-tight">Questions before choosing original wall art</h2>
            </div>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {faqs.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium">
                    <span className="inline-flex w-full items-center justify-between gap-4">
                      {item.question}
                      <span className="text-stone-400 group-open:hidden">+</span>
                      <span className="hidden text-stone-400 group-open:inline">-</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <SectionIntro
              eyebrow="Continue"
              title="Choose by room, size, or custom need"
              text="Use these paths when you are ready to compare paintings or ask for room-fit advice."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <RelatedLink href="/collections/large-canvas-art" title="Large Canvas Art" />
              <RelatedLink href="/collections/abstract-art-for-living-room" title="Living Room Art" />
              <RelatedLink href="/collections/bedroom-wall-art" title="Bedroom Wall Art" />
              <RelatedLink href="/contact" title="Request Room Advice" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ArticleSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr]">
        <div>
          <p className="mb-3 text-sm uppercase text-stone-500">{eyebrow}</p>
          <h2 className="text-4xl font-light leading-tight">{title}</h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-stone-600">{children}</div>
      </div>
    </section>
  )
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="mb-3 text-sm uppercase text-stone-500">{eyebrow}</p>
      <h2 className="text-4xl font-light leading-tight">{title}</h2>
      {text && <p className="mt-4 text-sm leading-6 text-stone-600">{text}</p>}
    </div>
  )
}

function RelatedLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="flex min-h-24 items-center justify-between border border-stone-200 bg-white px-5 py-4 transition hover:border-black">
      <span className="font-medium">{title}</span>
      <span className="text-sm text-stone-400">View</span>
    </Link>
  )
}
