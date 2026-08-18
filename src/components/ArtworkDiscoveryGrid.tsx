"use client"

import Image from "next/image"
import Link from "next/link"
import { Dispatch, SetStateAction, useMemo, useState, type MouseEvent } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"
import {
  ArtworkDiscoveryItem,
  ArtworkFilterKey,
  ArtworkFilterState,
  ArtworkSortMode,
  artworkFilterGroups,
  artworkMatchesCollection,
  artworkMatchesFilters,
  countActiveArtworkFilters,
  emptyArtworkFilters,
  normalizeArtworkFilters,
  sortArtworkDiscoveryItems,
  type ArtworkCollectionTab,
} from "@/lib/artwork-discovery"
import { tileCollectionCue, visibleFilterOptions } from "@/lib/storefront/editorial-presentation"

type ArtworkDiscoveryGridProps = {
  items: ArtworkDiscoveryItem[]
  initialFilters?: Partial<ArtworkFilterState>
  initialSort?: ArtworkSortMode
  emptyText?: string
}

export default function ArtworkDiscoveryGrid({
  items,
  initialFilters,
  initialSort = "featured",
  emptyText,
}: ArtworkDiscoveryGridProps) {
  const { t } = useLanguage()
  const [filters, setFilters] = useState<ArtworkFilterState>(() => normalizeArtworkFilters(initialFilters))
  const [sortMode, setSortMode] = useState<ArtworkSortMode>(initialSort)
  const [collection, setCollection] = useState<ArtworkCollectionTab>("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtersVisible, setFiltersVisible] = useState(true)
  const activeCount = countActiveArtworkFilters(filters)

  const collectionItems = useMemo(
    () => items.filter((item) => artworkMatchesCollection(item, collection)),
    [collection, items],
  )

  const filteredItems = useMemo(() => {
    return sortArtworkDiscoveryItems(
      collectionItems.filter((item) => artworkMatchesFilters(item, filters)),
      sortMode,
    )
  }, [collectionItems, filters, sortMode])

  const optionCounts = useMemo(() => buildOptionCounts(collectionItems), [collectionItems])
  const translateOption = (option: string) => {
    const translated = t(`discovery.option.${option}`)
    return translated === `discovery.option.${option}` ? option : translated
  }

  return (
    <div className="optimized-product-grid">
      <div className="mb-9 flex gap-1 overflow-hidden border-b border-black/20 md:overflow-x-auto" role="tablist" aria-label="Artwork collections">
        {([
          ["all", "All Art", "All"],
          ["new_collection", "New Collections", "New Works"],
          ["artist_collection", "Artist Collection", "Artists"],
        ] as const).map(([value, label, compactLabel]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={collection === value}
            onClick={() => setCollection(value)}
            className={`min-h-12 min-w-0 flex-1 whitespace-nowrap border-b-2 px-2 text-sm transition-colors duration-200 md:flex-none md:px-5 ${
              collection === value
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-stone-500 hover:text-[#171717]"
            }`}
          >
            <span className="md:hidden">{compactLabel}</span>
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className={`grid gap-8 ${filtersVisible ? "lg:grid-cols-[220px_minmax(0,1fr)]" : ""} xl:gap-10`}>
      {filtersVisible ? <aside className="border-y border-black/15 bg-[#f4f0e8] px-3 lg:sticky lg:top-[calc(var(--yiiart-header-offset)+24px)] lg:self-start lg:border-0 lg:bg-transparent lg:px-0">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="artwork-filter-options"
          className="flex min-h-14 w-full items-center justify-between py-3 text-sm lg:hidden"
        >
          <span>{t("discovery.filters")}{activeCount > 0 ? ` (${activeCount})` : ""}</span>
          <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
        </button>

        <div id="artwork-filter-options" className={`${filtersOpen ? "block" : "hidden"} pb-5 lg:block lg:pb-0`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-stone-500">{t("discovery.filters")}</p>
            <p className="mt-1 text-sm text-stone-600">
              {formatResultCount(t("discovery.resultCount"), filteredItems.length, collectionItems.length)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(emptyArtworkFilters)}
            disabled={activeCount === 0}
            className="text-sm underline underline-offset-4 disabled:text-stone-300"
          >
            {t("discovery.clear")}
          </button>
        </div>

        <div className="space-y-6">
          {artworkFilterGroups.map((group) => (
            <fieldset key={group.key}>
              <legend className="mb-3 text-sm font-medium">{t(`discovery.group.${group.key}`)}</legend>
              <div className="divide-y divide-stone-200 border-y border-stone-200">
              {visibleFilterOptions(group.options, optionCounts[group.key], filters[group.key]).map((option) => {
                  const checked = filters[group.key].includes(option)
                  const count = optionCounts[group.key].get(option) || 0

                  return (
                    <label
                      key={option}
                      className={`flex min-h-10 items-center justify-between gap-3 px-1 py-2 text-sm transition ${
                        checked ? "bg-[#eceae4] text-[#171717]" : "text-stone-700 hover:bg-[#f5f4f0]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFilter(group.key, option, setFilters)}
                          className="h-4 w-4"
                        />
                        <span>{translateOption(option)}</span>
                      </span>
                      <span className="text-stone-400">{count}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
        </div>
      </aside> : null}

      <section>
        <div className="meson-discovery-toolbar mb-5 flex flex-col justify-between gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="hidden min-h-10 items-center rounded-full border border-stone-800 bg-white px-4 text-sm lg:inline-flex"
              onClick={() => setFiltersVisible((visible) => !visible)}
            >
              {filtersVisible ? "Hide filters" : "Show filters"}
            </button>
            <span className="text-sm text-stone-600">
              <strong className="font-medium text-stone-900">{filteredItems.length}</strong> artworks
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {activeCount > 0 ? (
              activeFilterLabels(filters, t, translateOption).map((label) => (
                <span key={label} className="rounded-full border border-black/15 bg-[#fffdf8] px-3 py-1 text-xs text-stone-600">
                  {label}
                </span>
              ))
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-stone-500">{t("discovery.sort")}</span>
            <select
              aria-label="Sort artworks"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as ArtworkSortMode)}
              className="min-h-10 rounded-full border border-stone-800 bg-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#171717]"
            >
              <option value="featured">{t("discovery.sortFeatured")}</option>
              <option value="newest">{t("discovery.sortNewest")}</option>
              <option value="price-asc">{t("discovery.sortPriceAsc")}</option>
              <option value="price-desc">{t("discovery.sortPriceDesc")}</option>
              <option value="large-first">{t("discovery.sortLargeFirst")}</option>
            </select>
          </label>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 ${filtersVisible ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
          {filteredItems.length > 0 ? (
            filteredItems.map((artwork) => (
              <ArtworkTile key={artwork.id} artwork={artwork} translateOption={translateOption} />
            ))
          ) : (
            <div className="col-span-full border-y border-stone-200 py-12 text-center text-stone-500">
              <p>{emptyText || t("discovery.empty")}</p>
              <button
                type="button"
                onClick={() => setFilters(emptyArtworkFilters)}
                className="mt-4 text-sm underline underline-offset-4"
              >
                {t("discovery.reset")}
              </button>
            </div>
          )}
        </div>

        {collectionItems.length > 0 && (
          <p className="mt-8 text-center text-xs text-stone-500">
            <PriceDisclosure />
          </p>
        )}
      </section>
      </div>
    </div>
  )
}

function ArtworkTile({
  artwork,
  translateOption,
}: {
  artwork: ArtworkDiscoveryItem
  translateOption: (option: string) => string
}) {
  const collectionCue = tileCollectionCue(artwork)
  const { isInWishlist, toggleWishlist } = useWishlist()
  const saved = isInWishlist(artwork.id)

  const onWishlist = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!artwork.imageUrl) return
    toggleWishlist({
      id: artwork.id,
      slug: artwork.href.replace("/artwork/", ""),
      title: artwork.title,
      artist: artwork.artistName,
      price: artwork.price || 0,
      image: artwork.imageUrl,
    })
  }

  return (
    <Link href={artwork.href} className="meson-product-card group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f4f0]">
        {artwork.imageUrl ? (
          <>
            <Image
              src={artwork.imageUrl}
              alt={buildArtworkTileAlt(artwork, translateOption)}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition-opacity duration-300 ${artwork.hoverImageUrl ? "group-hover:opacity-0" : "transition-transform duration-500 group-hover:scale-[1.02]"}`}
            />
            {artwork.hoverImageUrl ? (
              <Image
                src={artwork.hoverImageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">Artwork</div>
        )}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1d1d1d] transition hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill={saved ? "currentColor" : "none"} aria-hidden="true">
            <path
              d="M10 16.2S3.8 12.2 3.8 7.9C3.8 5.9 5.3 4.5 7.2 4.5C8.4 4.5 9.4 5.1 10 6C10.6 5.1 11.6 4.5 12.8 4.5C14.7 4.5 16.2 5.9 16.2 7.9C16.2 12.2 10 16.2 10 16.2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-10 translate-y-1 items-center justify-center bg-[#171717]/88 text-[12px] font-medium tracking-[0.04em] text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          Choose options
        </span>
      </div>
      <div className="bg-transparent px-0 py-3">
        {collectionCue && <p className="mb-1.5 text-[0.65rem] font-medium uppercase text-[#a4a4a4]">{collectionCue}</p>}
        <p className="truncate text-[0.65rem] uppercase text-stone-500 sm:text-xs">
          {[translateOption(artwork.category), translateOption(artwork.medium)].filter(Boolean).join(" / ")}
        </p>
        <div className="mt-1.5 grid gap-1.5 sm:flex sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-medium leading-snug text-stone-950 sm:text-base">{artwork.title}</h3>
            <p className="mt-1 truncate text-xs text-stone-500 sm:text-sm">{artwork.artistName}</p>
          </div>
          <p className="shrink-0 text-sm font-medium text-stone-950 sm:text-right">
            <span className="text-[12px] font-normal text-[#a4a4a4]">From </span>
            <PriceText amountCny={artwork.price} />
          </p>
        </div>
        <p className="pt-2 text-[13px] font-medium text-[#171717] underline-offset-4 group-hover:underline">Choose options</p>
        <p className="mt-2 text-xs leading-5 text-stone-500 sm:mt-3 sm:text-sm">
          {artwork.dimensions || "Size on request"}
        </p>
        {artwork.customRequestAvailable && <p className="mt-2 text-[0.68rem] text-stone-500 sm:mt-3 sm:text-xs">Custom size and colour available</p>}
      </div>
    </Link>
  )
}

function buildArtworkTileAlt(
  artwork: ArtworkDiscoveryItem,
  translateOption: (option: string) => string
) {
  const details = [
    translateOption(artwork.category),
    translateOption(artwork.medium),
    artwork.dimensions,
  ].filter(Boolean).join(", ")

  return details
    ? `${artwork.title}, handmade artwork, ${details}`
    : `${artwork.title}, handmade artwork by ${artwork.artistName}`
}

function toggleFilter(
  key: ArtworkFilterKey,
  option: string,
  setFilters: Dispatch<SetStateAction<ArtworkFilterState>>
) {
  setFilters((current) => {
    const active = current[key]
    const nextValues = active.includes(option)
      ? active.filter((value) => value !== option)
      : [...active, option]

    return { ...current, [key]: nextValues }
  })
}

function buildOptionCounts(items: ArtworkDiscoveryItem[]) {
  const counts: Record<ArtworkFilterKey, Map<string, number>> = {
    styles: new Map(),
    rooms: new Map(),
    colors: new Map(),
    sizes: new Map(),
    orientations: new Map(),
  }

  for (const item of items) {
    increment(counts.styles, item.styles)
    increment(counts.rooms, item.rooms)
    increment(counts.colors, item.colors)
    increment(counts.sizes, [item.size])
    increment(counts.orientations, [item.orientation])
  }

  return counts
}

function increment(map: Map<string, number>, values: string[]) {
  for (const value of values) {
    map.set(value, (map.get(value) || 0) + 1)
  }
}

function activeFilterLabels(
  filters: ArtworkFilterState,
  t: (key: string) => string,
  translateOption: (option: string) => string
) {
  return artworkFilterGroups.flatMap((group) =>
    filters[group.key].map((value) => `${t(`discovery.group.${group.key}`)}: ${translateOption(value)}`)
  )
}

function formatResultCount(template: string, shown: number, total: number) {
  return template
    .replace("{shown}", String(shown))
    .replace("{total}", String(total))
}
