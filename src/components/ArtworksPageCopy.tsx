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
    <div className="mb-7 grid gap-3 border-b border-stone-200 pb-7 md:grid-cols-[minmax(0,0.75fr)_minmax(340px,1.25fr)] md:items-end">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-[#75432f]">Curated handmade art</p>
        <h1 className="max-w-[14ch] text-4xl font-light leading-none md:text-5xl">{title}</h1>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-stone-600 md:justify-self-end">
        {t("artworksPage.description")}
      </p>
    </div>
  )
}

export function CuratedPathsCopy() {
  const { t } = useLanguage()

  return (
    <div>
      <p className="text-[0.65rem] font-medium uppercase text-[#75432f]">{t("artworksPage.curatedPaths")}</p>
      <h2 className="mt-1 text-lg font-medium">{t("artworksPage.shopBy")}</h2>
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
