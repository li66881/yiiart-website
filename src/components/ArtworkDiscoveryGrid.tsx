"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { PriceDisclosure } from "@/components/PriceText"
import ProductCard from "@/components/storefront/ProductCard"
import { useLanguage } from "@/context/LanguageContext"
import {
  ArtworkDiscoveryItem,
  ArtworkFilterKey,
  ArtworkFilterState,
  artworkFilterGroups,
  artworkMatchesCollection,
  artworkMatchesFilters,
  countActiveArtworkFilters,
  emptyArtworkFilters,
  normalizeArtworkFilters,
  type ArtworkCollectionTab,
} from "@/lib/artwork-discovery"
import { visibleFilterOptions } from "@/lib/storefront/editorial-presentation"

type SortMode = "featured" | "newest" | "price-asc" | "price-desc" | "large-first"

type ArtworkDiscoveryGridProps = {
  items: ArtworkDiscoveryItem[]
  initialFilters?: Partial<ArtworkFilterState>
  initialSortMode?: SortMode
  cardBadge?: string | null
  emptyText?: string
}

export default function ArtworkDiscoveryGrid({
  items,
  initialFilters,
  initialSortMode = "featured",
  cardBadge = null,
  emptyText,
}: ArtworkDiscoveryGridProps) {
  const { t } = useLanguage()
  const [filters, setFilters] = useState<ArtworkFilterState>(() => normalizeArtworkFilters(initialFilters))
  const [sortMode, setSortMode] = useState<SortMode>(initialSortMode)
  const [collection, setCollection] = useState<ArtworkCollectionTab>("all")
  const [filtersVisible, setFiltersVisible] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(artworkFilterGroups.map((group, index) => [group.key, index < 3])),
  )
  const activeCount = countActiveArtworkFilters(filters)

  const collectionItems = useMemo(
    () => items.filter((item) => artworkMatchesCollection(item, collection)),
    [collection, items],
  )

  const filteredItems = useMemo(() => {
    return collectionItems
      .filter((item) => artworkMatchesFilters(item, filters))
      .slice()
      .sort((a, b) => sortArtworkItems(a, b, sortMode))
  }, [collectionItems, filters, sortMode])

  const optionCounts = useMemo(() => buildOptionCounts(collectionItems), [collectionItems])
  const translateOption = (option: string) => {
    const translated = t(`discovery.option.${option}`)
    return translated === `discovery.option.${option}` ? option : translated
  }

  useEffect(() => {
    if (!mobileFiltersOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileFiltersOpen])

  const filterPanel = (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <p className="text-sm font-medium text-stone-900">Filter and sort</p>
          <p className="mt-1 text-xs text-stone-500">
            {filteredItems.length} of {collectionItems.length} products
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFilters(emptyArtworkFilters)}
          disabled={activeCount === 0}
          className="text-xs underline underline-offset-4 disabled:text-stone-300"
        >
          Clear all
        </button>
      </div>

      {artworkFilterGroups.map((group) => {
        const isOpen = openGroups[group.key]
        return (
          <fieldset key={group.key} className="border-b border-stone-200 py-3">
            <legend className="w-full">
              <button
                type="button"
                className="flex w-full items-center justify-between py-1 text-left text-sm font-medium text-stone-900"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))
                }
              >
                <span>{t(`discovery.group.${group.key}`)}</span>
                <span aria-hidden className="text-stone-400">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </legend>
            {isOpen ? (
              <div className="mt-2 space-y-1.5 pb-1">
                {visibleFilterOptions(group.options, optionCounts[group.key], filters[group.key]).map((option) => {
                  const checked = filters[group.key].includes(option)
                  const count = optionCounts[group.key].get(option) || 0
                  return (
                    <label
                      key={option}
                      className="flex min-h-9 cursor-pointer items-center justify-between gap-3 px-0.5 text-sm text-stone-700 hover:text-stone-950"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFilter(group.key, option, setFilters)}
                          className="h-3.5 w-3.5 accent-[#181613]"
                        />
                        <span>
                          {translateOption(option)}
                          <span className="text-stone-400">({count})</span>
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : null}
          </fieldset>
        )
      })}
    </div>
  )

  return (
    <div>
      <div
        className="mb-8 flex gap-1 overflow-x-auto border-b border-black/15"
        role="tablist"
        aria-label="Artwork collections"
      >
        {(
          [
            ["all", "All Art", "All"],
            ["new_collection", "New Collections", "New"],
            ["artist_collection", "Artist Collection", "Artists"],
          ] as const
        ).map(([value, label, compactLabel]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={collection === value}
            onClick={() => setCollection(value)}
            className={`min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 text-sm transition-colors duration-200 ${
              collection === value
                ? "border-[#181613] text-[#181613]"
                : "border-transparent text-stone-500 hover:text-[#181613]"
            }`}
          >
            <span className="md:hidden">{compactLabel}</span>
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-full border border-stone-800 bg-white px-4 text-sm lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filter and sort{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <button
            type="button"
            className="hidden min-h-10 items-center rounded-full border border-stone-800 bg-white px-4 text-sm lg:inline-flex"
            onClick={() => setFiltersVisible((open) => !open)}
          >
            {filtersVisible ? "Hide filters" : "Show filters"}
          </button>
          <p className="text-sm text-stone-600">
            <span className="font-medium text-stone-900">{filteredItems.length}</span> products
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-stone-500">Sort by</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="min-h-10 rounded-full border border-stone-800 bg-white px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#181613]"
          >
            <option value="featured">Featured</option>
            <option value="newest">Date, new to old</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="large-first">Large first</option>
          </select>
        </label>
      </div>

      {activeCount > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeFilterLabels(filters, t, translateOption).map((label) => (
            <span key={label} className="border border-stone-300 bg-white px-3 py-1 text-xs text-stone-600">
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className={`grid gap-8 ${filtersVisible ? "lg:grid-cols-[220px_minmax(0,1fr)]" : ""}`}>
        {filtersVisible ? (
          <aside className="hidden lg:sticky lg:top-[calc(var(--ya-header-offset-lg)+0.75rem)] lg:block lg:self-start">{filterPanel}</aside>
        ) : null}

        <section>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-4 xl:gap-y-9">
            {filteredItems.length > 0 ? (
              filteredItems.map((artwork) => (
                <ProductCard
                  key={artwork.id}
                  item={{
                    id: artwork.id,
                    href: artwork.href,
                    title: artwork.title,
                    priceCny: artwork.price,
                    image: artwork.imageUrl,
                    hoverImage: artwork.hoverImageUrl || artwork.imageUrl,
                    sku: artwork.sku,
                    badge: cardBadge || (artwork.collectionType === "new_collection" ? "Gallery Quality" : null),
                  }}
                />
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

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100vw,360px)] flex-col bg-[#fbfaf6] shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <p className="text-sm font-medium">Filter and sort</p>
              <button type="button" className="px-2 text-2xl leading-none" onClick={() => setMobileFiltersOpen(false)}>
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{filterPanel}</div>
            <div className="border-t border-stone-200 p-4">
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-center bg-[#181613] text-sm text-white"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {filteredItems.length} products
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function toggleFilter(
  key: ArtworkFilterKey,
  option: string,
  setFilters: Dispatch<SetStateAction<ArtworkFilterState>>,
) {
  setFilters((current) => {
    const active = current[key]
    return {
      ...current,
      [key]: active.includes(option) ? active.filter((value) => value !== option) : [...active, option],
    }
  })
}

function activeFilterLabels(
  filters: ArtworkFilterState,
  t: (key: string) => string,
  translateOption: (option: string) => string,
) {
  return artworkFilterGroups.flatMap((group) =>
    filters[group.key].map((option) => `${t(`discovery.group.${group.key}`)}: ${translateOption(option)}`),
  )
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
    bump(counts.styles, item.styles)
    bump(counts.rooms, item.rooms)
    bump(counts.colors, item.colors)
    bump(counts.sizes, [item.size])
    bump(counts.orientations, [item.orientation])
  }

  return counts
}

function bump(map: Map<string, number>, values: string[]) {
  for (const value of values.filter(Boolean)) {
    map.set(value, (map.get(value) || 0) + 1)
  }
}

function sortArtworkItems(a: ArtworkDiscoveryItem, b: ArtworkDiscoveryItem, sortMode: SortMode) {
  if (sortMode === "price-asc") return priceValue(a) - priceValue(b)
  if (sortMode === "price-desc") return priceValue(b) - priceValue(a)
  if (sortMode === "large-first") return sizeRank(b.size) - sizeRank(a.size)
  if (sortMode === "newest") return String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
  return 0
}

function priceValue(item: ArtworkDiscoveryItem) {
  return Number(item.price || 0)
}

function sizeRank(size: string) {
  if (size === "Oversized") return 4
  if (size === "Large") return 3
  if (size === "Medium") return 2
  if (size === "Small") return 1
  return 0
}
