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
      <p className="text-xs uppercase tracking-wider text-gray-500">{translated.eyebrow}</p>
      <h3 className="mt-2 font-medium">{translated.title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{translated.meta}</p>
    </>
  )
}

export function StorefrontCollectionCard({ collection, image }: StorefrontCollectionCardProps) {
  const translated = useTranslatedCollection(collection)

  return (
    <Link href={collection.href} className="group block border bg-white">
      <div className="aspect-[5/3] overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={translated.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">YiiArt collection</div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wider text-gray-500">{translated.eyebrow}</p>
        <h3 className="mt-2 text-xl font-light">{translated.title}</h3>
        <p className="mt-3 text-sm leading-6 text-gray-600">{translated.description}</p>
        <p className="mt-5 text-xs uppercase tracking-wider text-gray-400">{translated.meta}</p>
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
