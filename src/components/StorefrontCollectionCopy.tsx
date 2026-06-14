"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"
import type { StorefrontCollectionTile } from "@/lib/storefront-content"

type StorefrontCollectionCardProps = {
  collection: StorefrontCollectionTile
  image?: string
}

export function StorefrontCollectionSummary({ collection }: { collection: StorefrontCollectionTile }) {
  const translated = useTranslatedCollection(collection)

  return (
    <>
      <p className="text-xs uppercase text-stone-500">{translated.eyebrow}</p>
      <h3 className="mt-2 font-medium text-stone-950">{translated.title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{translated.meta}</p>
    </>
  )
}

export function StorefrontCollectionCard({ collection, image }: StorefrontCollectionCardProps) {
  const translated = useTranslatedCollection(collection)

  return (
    <Link href={collection.href} className="group block border border-stone-200 bg-white transition hover:border-stone-950">
      <div className="relative aspect-[5/3] overflow-hidden bg-stone-100">
        {image ? (
          <img
            src={image}
            alt={translated.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">YiiArt collection</div>
        )}
        <div className="absolute left-4 top-4 bg-white/90 px-3 py-1 text-xs uppercase text-stone-700 backdrop-blur">
          {translated.eyebrow}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-light text-stone-950">{translated.title}</h3>
        <p className="mt-3 text-sm leading-6 text-stone-600">{translated.description}</p>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-stone-200 pt-4">
          <p className="text-xs uppercase text-stone-500">{translated.meta}</p>
          <span className="text-sm text-stone-950 opacity-0 transition group-hover:opacity-100">View</span>
        </div>
      </div>
    </Link>
  )
}

function useTranslatedCollection(collection: StorefrontCollectionTile) {
  const { t } = useLanguage()
  const slug = collection.href.split("/").filter(Boolean).pop() || ""

  return {
    eyebrow: translateWithFallback(t, `collections.tiles.${slug}.eyebrow`, collection.eyebrow),
    title: translateWithFallback(t, `collections.tiles.${slug}.title`, collection.title),
    description: translateWithFallback(t, `collections.tiles.${slug}.description`, collection.description),
    meta: translateWithFallback(t, `collections.tiles.${slug}.meta`, collection.meta),
  }
}

function translateWithFallback(t: (key: string) => string, key: string, fallback: string) {
  const value = t(key)
  return value === key ? fallback : value
}
