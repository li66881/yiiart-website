"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

type HeroSectionProps = {
  imageUrl?: string
  imageAlt?: string
}

export default function HeroSection({ imageUrl, imageAlt = "Original YiiArt artwork in a home interior" }: HeroSectionProps) {
  const { t } = useLanguage()
  const fallbackImage = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80"

  return (
    <section className="relative mt-16 flex min-h-[78svh] items-center justify-center overflow-hidden">
      <img 
        src={imageUrl || fallbackImage}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
        <h1 className="mb-6 text-5xl font-light md:text-7xl">
          {t("hero.title")}<br /><em>{t("hero.titleEmphasis")}</em>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">{t("hero.subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/artworks" className="px-8 py-3 bg-white text-black hover:bg-gray-100">
            {t("hero.browseArtworks")}
          </Link>
          <Link href="/artists" className="px-8 py-3 border border-white hover:bg-white/10">
            {t("hero.meetArtists")}
          </Link>
        </div>
      </div>
    </section>
  )
}
