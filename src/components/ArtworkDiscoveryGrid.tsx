"use client"

import Link from "next/link"
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
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

type SortMode = "featured" | "price-asc" | "price-desc" | "large-first"

type ArtworkDiscoveryGridProps = {
  items: ArtworkDiscoveryItem[]
  initialFilters?: Partial<ArtworkFilterState>
  emptyText?: string
}

export default function ArtworkDiscoveryGrid({
  items,
  initialFilters,
  emptyText,
}: ArtworkDiscoveryGridProps) {
  const { t } = useLanguage()
  const [filters, setFilters] = useState<ArtworkFilterState>(() => normalizeArtworkFilters(initialFilters))
  const [sortMode, setSortMode] = useState<SortMode>("featured")
  const [collection, setCollection] = useState<ArtworkCollectionTab>("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  return (
    <div>
      <div className="mb-12 flex gap-1 overflow-hidden border-b border-black/20 md:overflow-x-auto" role="tablist" aria-label="Artwork collections">
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
                ? "border-[#26352c] text-[#26352c]"
                : "border-transparent text-stone-500 hover:text-[#26352c]"
            }`}
          >
            <span className="md:hidden">{compactLabel}</span>
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-y border-black/15 bg-[#f4f0e8] lg:sticky lg:top-28 lg:self-start lg:border-0 lg:border-t lg:px-0 lg:py-5">
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
              <div className="space-y-2">
                {group.options.map((option) => {
                  const checked = filters[group.key].includes(option)
                  const count = optionCounts[group.key].get(option) || 0

                  return (
                    <label
                      key={option}
                      className={`flex min-h-10 items-center justify-between gap-3 border px-3 py-2 text-sm transition ${
                        checked ? "border-[#26352c] bg-[#26352c] text-white" : "border-black/15 bg-[#fffdf8] hover:border-[#26352c]"
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
                      <span className={checked ? "text-white/70" : "text-stone-400"}>{count}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
        </div>
      </aside>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {activeCount > 0 ? (
              activeFilterLabels(filters, t, translateOption).map((label) => (
                <span key={label} className="border border-black/15 bg-[#fffdf8] px-3 py-1 text-xs text-stone-600">
                  {label}
                </span>
              ))
            ) : (
              <span className="text-sm text-stone-500">{t("discovery.allAvailable")}</span>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-stone-500">{t("discovery.sort")}</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="border border-black/20 bg-[#fffdf8] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#26352c]"
            >
              <option value="featured">{t("discovery.sortFeatured")}</option>
              <option value="price-asc">{t("discovery.sortPriceAsc")}</option>
              <option value="price-desc">{t("discovery.sortPriceDesc")}</option>
              <option value="large-first">{t("discovery.sortLargeFirst")}</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
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
  return (
    <Link href={artwork.href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e1d6]">
        {artwork.imageUrl ? (
          <img
            src={artwork.imageUrl}
            alt={buildArtworkTileAlt(artwork, translateOption)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">Artwork</div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/68 px-4 py-3 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span>{artwork.orientation}</span>
          <span>View details</span>
        </div>
      </div>
      <div className="bg-transparent px-0 py-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {artwork.productionModel === "hand_painted_to_order" && (
            <span className="border border-black/15 bg-[#fffdf8] px-2 py-1 text-xs text-stone-600">
              Hand-painted to order
            </span>
          )}
          {artwork.collectionType === "artist_collection" && (
            <span className="border border-black/15 bg-[#fffdf8] px-2 py-1 text-xs text-stone-600">
              Artist Collection
            </span>
          )}
          {artwork.customRequestAvailable && (
            <span className="border border-black/15 bg-[#fffdf8] px-2 py-1 text-xs text-stone-600">
              Custom request
            </span>
          )}
        </div>
        <p className="text-xs uppercase text-stone-500">
          {[translateOption(artwork.category), translateOption(artwork.medium)].filter(Boolean).join(" / ")}
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium leading-snug text-stone-950">{artwork.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{artwork.artistName}</p>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold text-stone-950">
            <PriceText amountCny={artwork.price} />
          </p>
        </div>
        <p className="mt-3 border-y border-black/15 py-2 text-sm font-medium text-stone-700">
          {artwork.dimensions || "Size on request"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[artwork.size, artwork.rooms[0], artwork.colors[0]].filter(Boolean).map((tag) => (
            <span key={tag} className="border border-black/15 bg-[#fffdf8] px-2 py-1 text-xs text-stone-600">
              {translateOption(tag)}
            </span>
          ))}
        </div>
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

function sortArtworkItems(a: ArtworkDiscoveryItem, b: ArtworkDiscoveryItem, sortMode: SortMode) {
  if (sortMode === "price-asc") return priceValue(a) - priceValue(b)
  if (sortMode === "price-desc") return priceValue(b) - priceValue(a)
  if (sortMode === "large-first") return sizeRank(b.size) - sizeRank(a.size)
  return dateValue(b.createdAt) - dateValue(a.createdAt)
}

function priceValue(item: ArtworkDiscoveryItem) {
  return typeof item.price === "number" ? item.price : Number.MAX_SAFE_INTEGER
}

function dateValue(value?: string) {
  return value ? new Date(value).getTime() || 0 : 0
}

function sizeRank(size: string) {
  const ranks: Record<string, number> = {
    Small: 1,
    Medium: 2,
    Large: 3,
    Oversized: 4,
  }
  return ranks[size] || 0
}

function formatResultCount(template: string, shown: number, total: number) {
  return template
    .replace("{shown}", String(shown))
    .replace("{total}", String(total))
}
