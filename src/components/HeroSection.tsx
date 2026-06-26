"use client"

import Link from "next/link"

type HeroSectionProps = {
  imageUrl?: string
  imageAlt?: string
}

const confidenceKeys = [
  { value: "100%", title: "trust.original", text: "trust.originalDesc" },
  { valueKey: "cart.free", title: "trust.shipping", text: "trust.shippingDesc" },
  { value: "30", title: "trust.trial", text: "trust.trialDesc" },
  { value: "80%", title: "trust.support", text: "trust.supportDesc" },
]

export default function HeroSection({ imageUrl, imageAlt = "Original YiiArt artwork in a home interior" }: HeroSectionProps) {
  return (
    <section className="relative mt-24 min-h-[calc(100svh-6rem)] overflow-hidden bg-stone-950 text-white">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#24211d]">
          <div className="absolute inset-x-[8%] top-[14%] h-[58%] border border-white/18 bg-[#3b332b]" />
          <div className="absolute left-[14%] top-[20%] h-[42%] w-[34%] border border-white/18 bg-[#5f5a50]" />
          <div className="absolute right-[12%] top-[46%] h-[16%] w-[32%] border-t border-white/18" />
          <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-[#15130f]" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/38 to-black/18" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] max-w-[1440px] flex-col justify-end px-4 pb-8 pt-20 sm:px-6 lg:px-10">
        <div className="max-w-3xl pb-10">
          <p className="mb-5 text-sm uppercase text-white/72">Handmade canvas art for modern homes</p>
          <h1 className="max-w-3xl text-5xl font-light leading-none md:text-7xl">
            Handmade Modern Paintings for Beautiful Interiors
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86 md:text-xl">
            Custom-size canvas art for living rooms, bedrooms, offices, and design projects.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#featured-works" className="bg-white px-7 py-4 text-center text-sm font-medium text-black transition hover:bg-stone-100">
              Shop Featured Works
            </Link>
            <Link href="/custom-painting" className="border border-white/65 px-7 py-4 text-center text-sm font-medium text-white transition hover:bg-white hover:text-black">
              Request Custom Painting
            </Link>
          </div>
        </div>

        <div className="grid border-t border-white/24 pt-5 text-white/86 sm:grid-cols-2 lg:grid-cols-4">
          {confidenceKeys.map((item) => (
            <div key={item.title} className="border-white/20 py-4 sm:pr-6 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
              <p className="text-2xl font-light">{item.valueKey ? "Free" : item.value}</p>
              <p className="mt-2 font-medium">{trustLabel(item.title)}</p>
              <p className="mt-1 text-sm text-white/62">{trustLabel(item.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function trustLabel(key: string) {
  const labels: Record<string, string> = {
    "trust.original": "Handmade paintings",
    "trust.originalDesc": "Original canvas works",
    "trust.shipping": "Worldwide shipping",
    "trust.shippingDesc": "Secure packaging",
    "trust.trial": "30-day support",
    "trust.trialDesc": "Eligible returns",
    "trust.support": "Artist-led studio",
    "trust.supportDesc": "Custom art guidance",
  }

  return labels[key] || key
}
