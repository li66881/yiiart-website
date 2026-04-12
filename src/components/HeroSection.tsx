"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative h-screen flex items-center justify-center mt-16">
      <img 
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80" 
        alt="Hero" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-light mb-6">
          {t("hero.title")}<br /><em>{t("hero.titleEmphasis")}</em>
        </h1>
        <p className="text-xl mb-8 opacity-90">{t("hero.subtitle")}</p>
        <div className="flex gap-4 justify-center">
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
