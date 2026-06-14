"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

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
  const { t } = useLanguage()
  const fallbackImage = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80"

  return (
    <section className="relative mt-16 min-h-[calc(100svh-4rem)] overflow-hidden bg-stone-950 text-white">
      <img
        src={imageUrl || fallbackImage}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/38 to-black/18" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1440px] flex-col justify-end px-4 pb-8 pt-20 sm:px-6 lg:px-10">
        <div className="max-w-3xl pb-10">
          <p className="mb-5 text-sm uppercase text-white/72">Original paintings, direct from independent artists</p>
          <h1 className="max-w-3xl text-5xl font-light leading-none md:text-7xl">
            {t("hero.title")} <span className="font-normal italic">{t("hero.titleEmphasis")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86 md:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/artworks" className="bg-white px-7 py-4 text-center text-sm font-medium text-black transition hover:bg-stone-100">
              {t("hero.browseArtworks")}
            </Link>
            <Link href="/contact" className="border border-white/65 px-7 py-4 text-center text-sm font-medium text-white transition hover:bg-white hover:text-black">
              {t("home.requestRoomAdvice")}
            </Link>
          </div>
        </div>

        <div className="grid border-t border-white/24 pt-5 text-white/86 sm:grid-cols-2 lg:grid-cols-4">
          {confidenceKeys.map((item) => (
            <div key={item.title} className="border-white/20 py-4 sm:pr-6 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
              <p className="text-2xl font-light">{item.valueKey ? t(item.valueKey) : item.value}</p>
              <p className="mt-2 font-medium">{t(item.title)}</p>
              <p className="mt-1 text-sm text-white/62">{t(item.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
