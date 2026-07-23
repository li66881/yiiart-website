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
      <h1 className="mb-6 max-w-[11ch] text-5xl font-light leading-[.98] tracking-[-0.055em] md:text-7xl">{title}</h1>
      <p className="mb-12 max-w-xl text-base leading-8 text-stone-600">
        {t("artworksPage.description")}
      </p>
    </>
  )
}

export function CuratedPathsCopy() {
  const { t } = useLanguage()

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#75432f]">{t("artworksPage.curatedPaths")}</p>
      <h2 className="mt-3 text-3xl font-light tracking-[-0.045em]">{t("artworksPage.shopBy")}</h2>
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
