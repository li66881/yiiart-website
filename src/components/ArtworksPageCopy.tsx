"use client"

import { useLanguage } from "@/context/LanguageContext"

type ArtworksPageCopyProps = {
  activeCategory?: string
}

export function ArtworksPageHeroCopy({ activeCategory }: ArtworksPageCopyProps) {
  const { t } = useLanguage()
  const title = activeCategory
    ? `${translateDiscoveryOption(t, activeCategory)} ${t("common.artworks")}`
    : t("artworksPage.allTitle")

  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase text-[#75432f]">Curated handmade art</p>
      <h1 className="mb-5 max-w-[14ch] text-4xl font-light leading-none md:text-6xl">{title}</h1>
      <p className="mb-10 max-w-2xl text-base leading-8 text-stone-600">
        {t("artworksPage.description")}
      </p>
    </>
  )
}

export function CuratedPathsCopy() {
  const { t } = useLanguage()

  return (
    <div>
      <p className="text-xs font-medium uppercase text-[#75432f]">{t("artworksPage.curatedPaths")}</p>
      <h2 className="mt-3 text-2xl font-light md:text-3xl">{t("artworksPage.shopBy")}</h2>
    </div>
  )
}

export function LivingRoomsLinkCopy() {
  const { t } = useLanguage()
  return <>{t("artworksPage.livingRooms")}</>
}

function translateDiscoveryOption(t: (key: string) => string, option: string) {
  const key = `discovery.option.${option}`
  const translated = t(key)
  return translated === key ? option : translated
}
