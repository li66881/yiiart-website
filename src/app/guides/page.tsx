import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Wall Art Guides for Homes, Hotels & Restaurants",
  description:
    "Practical guides to original wall art for homes and hospitality spaces, including abstract art, room sizing, custom painting, and project planning.",
  path: "/guides",
})

const guides = [
  {
    title: "Original Wall Art Pairing Guide for Modern Homes",
    text: "Choose hand-painted canvas art by room, size, color, texture, shipping format, and custom painting needs.",
    href: "/guides/home-wall-art-pairing-guide",
    topic: "Wall Art Guide",
  },
  {
    title: "How to Plan Wall Art for Hotels and Restaurants",
    text: "A practical framework for artwork zoning, scale, abstract palettes, coordinated selections, custom commissions, and project briefs.",
    href: "/guides/hotel-restaurant-wall-art-planning",
    topic: "Hospitality Art Guide",
  },
  {
    title: "Hotel Artwork Project Brief: A Buyer’s Checklist",
    text: "Prepare room schedules, measurements, abstract palette references, quantities, delivery details, and questions to settle in a project quote.",
    href: "/guides/hotel-artwork-project-brief",
    topic: "Hospitality Buyer Checklist",
  },
  {
    title: "Restaurant Wall Art: Plan Paintings for Dining Spaces",
    text: "Choose paintings by dining zone, sightline, lighting, scale, and palette before planning a coordinated restaurant project.",
    href: "/guides/restaurant-wall-art-planning",
    topic: "Restaurant Art Guide",
  },
]

const quickLinks = [
  { title: "Artwork Size Guide", href: "/size-guide" },
  { title: "Large Canvas Art", href: "/collections/large-canvas-art" },
  { title: "Custom Painting", href: "/custom-painting" },
  { title: "Shipping & Returns", href: "/shipping-returns" },
]

const readingPaths = [
  {
    title: "Planning art for a hotel or restaurant",
    text: "Start with guest-room and public-space zones, wall measurements, coordinated abstract palettes, quantities, and a project brief.",
    links: [
      { title: "Hospitality project planning guide", href: "/guides/hotel-restaurant-wall-art-planning" },
      { title: "Hotel & restaurant artwork service", href: "/trade" },
      { title: "Dining room wall art", href: "/collections/dining-room-wall-art" },
      { title: "Restaurant wall art planning", href: "/guides/restaurant-wall-art-planning" },
    ],
  },
  {
    title: "Choosing abstract art for a room",
    text: "Compare the painting with the wall, furniture, natural light, and materials before choosing a ready-made or custom canvas.",
    links: [
      { title: "Home wall art pairing guide", href: "/guides/home-wall-art-pairing-guide" },
      { title: "Abstract art for living rooms", href: "/collections/abstract-art-for-living-room" },
      { title: "Request a custom painting", href: "/custom-painting" },
    ],
  },
  {
    title: "Checking scale before you buy",
    text: "Measure the wall and the furniture below it, then compare artwork width, orientation, and viewing distance.",
    links: [
      { title: "Artwork size guide", href: "/size-guide" },
      { title: "Large canvas art", href: "/collections/large-canvas-art" },
    ],
  },
]

export default function GuidesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-stone-950">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ])),
        }}
      />
      <main className="flex-1 pt-28">
        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm uppercase tracking-wider text-stone-500">YiiArt Guides</p>
              <h1 className="text-5xl font-light leading-tight md:text-6xl">Wall art guides for real rooms</h1>
            </div>
            <p className="max-w-3xl text-base leading-8 text-stone-600">
              Practical buying guidance for original paintings, large wall art, custom canvas art, room sizing, color
              matching, and international artwork delivery.
            </p>
          </div>
        </section>

        <section className="border-b border-stone-200 px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm uppercase tracking-wider text-stone-500">Browse by project</p>
              <h2 className="text-3xl font-light leading-tight sm:text-4xl">Find the right starting point</h2>
              <p className="mt-4 text-base leading-7 text-stone-600">
                Use these reading paths to move from room-planning questions to relevant artwork, sizing advice, or a custom project enquiry.
              </p>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {readingPaths.map((path) => (
                <section key={path.title} className="border-t border-stone-300 pt-5">
                  <h3 className="text-xl font-medium">{path.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{path.text}</p>
                  <ul className="mt-5 grid gap-3 text-sm">
                    {path.links.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="underline decoration-stone-300 underline-offset-4 hover:decoration-black">{item.title}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-5 md:grid-cols-2">
              {guides.map((guide) => (
                <Link key={guide.href} href={guide.href} className="group border border-stone-200 bg-[#fbfaf6] p-6 transition hover:border-black hover:bg-white">
                  <p className="text-sm uppercase text-stone-500">{guide.topic}</p>
                  <h2 className="mt-10 text-3xl font-light leading-tight group-hover:underline group-hover:underline-offset-4">
                    {guide.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-600">{guide.text}</p>
                  <p className="mt-8 text-sm text-stone-400">Read guide</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-sm uppercase text-stone-500">Helpful Links</p>
              <h2 className="text-4xl font-light leading-tight">Continue with buying support</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href} className="flex min-h-24 items-center justify-between border border-stone-200 bg-white px-5 py-4 transition hover:border-black">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-stone-400">View</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
