import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/lib/seo"

export const metadata: Metadata = buildSeoMetadata({
  title: "Wall Art Guides",
  description:
    "Helpful YiiArt guides for choosing original wall art, large canvas paintings, custom canvas art, size, color, and room fit.",
  path: "/guides",
})

const guides = [
  {
    title: "Original Wall Art Pairing Guide for Modern Homes",
    text: "Choose hand-painted canvas art by room, size, color, texture, shipping format, and custom painting needs.",
    href: "/guides/home-wall-art-pairing-guide",
    topic: "Wall Art Guide",
  },
]

const quickLinks = [
  { title: "Artwork Size Guide", href: "/size-guide" },
  { title: "Large Canvas Art", href: "/collections/large-canvas-art" },
  { title: "Custom Painting", href: "/custom-painting" },
  { title: "Shipping & Returns", href: "/shipping-returns" },
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
