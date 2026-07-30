"use client"

import { useLanguage } from "@/context/LanguageContext"

type ArtworksPageCopyProps = {
  activeCategory?: string
}

export function ArtworksPageHeroCopy({ activeCategory }: ArtworksPageCopyProps) {
  const { t } = useLanguage()
  const title = activeCategory
    ? `${translateDiscoveryOption(t, activeCategory)} ${t("common.artworks")}`
    : "New Arrivals"

  return (
    <div className="-mx-4 mb-8 bg-[#d8d9c4] px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <p className="mb-2 text-xs text-stone-600">Home / Collections / {title}</p>
      <h1 className="mb-3 text-4xl font-medium tracking-[-0.03em] text-stone-950 md:text-5xl">{title}</h1>
      <p className="max-w-3xl text-sm leading-6 text-stone-700 md:text-base md:leading-7">
        {activeCategory
          ? t("artworksPage.description")
          : "Browse the latest hand-painted canvases, choose your size and finish, and ship worldwide with studio packing."}
      </p>
    </div>
  )
}

export function CuratedPathsCopy() {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Discover</p>
      <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Shop by style</h2>
    </div>
  )
}

export function LivingRoomsLinkCopy() {
  return <>Shop living room art</>
}

function translateDiscoveryOption(t: (key: string) => string, option: string) {
  const key = `discovery.option.${option}`
  const translated = t(key)
  return translated === key ? option : translated
}
