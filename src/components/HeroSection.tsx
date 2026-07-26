"use client"

import Link from "next/link"

type HeroSectionProps = {
  imageUrl?: string
  imageAlt?: string
}

const confidenceKeys = [
  "Painted by hand",
  "Made to order",
  "Guidance for your room",
]

export default function HeroSection({ imageUrl, imageAlt = "Original YiiArt artwork in a home interior" }: HeroSectionProps) {
  return (
    <section className="relative mt-[104px] min-h-[calc(100svh-6.5rem)] overflow-hidden bg-stone-950 text-white">
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/42 to-black/12" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6.5rem)] max-w-[1440px] flex-col justify-end px-4 pb-8 pt-20 sm:px-6 lg:px-10">
        <div className="max-w-2xl pb-10">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-[#e0bda8]">Hand-painted to order</p>
          <h1 className="max-w-[10.8ch] text-5xl font-light leading-[.98] tracking-[-0.062em] md:text-7xl">
            Art, painted for the room you live in.
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-white/82 md:text-lg md:leading-8">
            Made-to-order, hand-painted canvas art shaped by real brushwork and prepared for your space.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#featured-works" className="bg-white px-7 py-4 text-center text-xs font-medium uppercase tracking-[0.1em] text-black transition hover:bg-[#eee7da]">
              Shop Hand-Painted Art
            </Link>
            <Link href="#process" className="border border-white/45 px-7 py-4 text-center text-xs font-medium uppercase tracking-[0.1em] text-white transition hover:bg-white/10">
              How It&apos;s Painted
            </Link>
          </div>
        </div>

        <div className="grid max-w-xl border-t border-white/24 pt-5 text-white/86 sm:grid-cols-3">
          {confidenceKeys.map((item) => (
            <div key={item} className="min-h-11 border-white/20 py-2 pr-4 text-sm leading-5 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

