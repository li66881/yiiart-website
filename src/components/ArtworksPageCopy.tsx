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
      <h1 className="mb-6 text-5xl font-light leading-tight">{title}</h1>
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
      <p className="text-sm uppercase text-stone-500">{t("artworksPage.curatedPaths")}</p>
      <h2 className="mt-2 text-2xl font-light">{t("artworksPage.shopBy")}</h2>
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
