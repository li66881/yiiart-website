"use client"

import Link from "next/link"
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import {
  ArtworkDiscoveryItem,
  ArtworkFilterKey,
  ArtworkFilterState,
  artworkFilterGroups,
  artworkMatchesFilters,
  countActiveArtworkFilters,
  emptyArtworkFilters,
  normalizeArtworkFilters,
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
  emptyText = "No artworks match these filters.",
}: ArtworkDiscoveryGridProps) {
  const [filters, setFilters] = useState<ArtworkFilterState>(() => normalizeArtworkFilters(initialFilters))
  const [sortMode, setSortMode] = useState<SortMode>("featured")
  const activeCount = countActiveArtworkFilters(filters)

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => artworkMatchesFilters(item, filters))
      .slice()
      .sort((a, b) => sortArtworkItems(a, b, sortMode))
  }, [filters, items, sortMode])

  const optionCounts = useMemo(() => buildOptionCounts(items), [items])

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border-y py-5 lg:border-y-0 lg:border-r lg:pr-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Filters</p>
            <p className="mt-1 text-sm text-gray-600">
              {filteredItems.length} of {items.length} works
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(emptyArtworkFilters)}
            disabled={activeCount === 0}
            className="text-sm underline underline-offset-4 disabled:text-gray-300"
          >
            Clear
          </button>
        </div>

        <div className="space-y-6">
          {artworkFilterGroups.map((group) => (
            <fieldset key={group.key}>
              <legend className="mb-3 text-sm font-medium">{group.label}</legend>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const checked = filters[group.key].includes(option)
                  const count = optionCounts[group.key].get(option) || 0

                  return (
                    <label
                      key={option}
                      className={`flex min-h-9 items-center justify-between gap-3 border px-3 py-2 text-sm transition ${
                        checked ? "border-black bg-black text-white" : "border-gray-200 hover:border-black"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFilter(group.key, option, setFilters)}
                          className="h-4 w-4"
                        />
                        <span>{option}</span>
                      </span>
                      <span className={checked ? "text-white/70" : "text-gray-400"}>{count}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </aside>

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {activeCount > 0 ? (
              activeFilterLabels(filters).map((label) => (
                <span key={label} className="border bg-gray-50 px-3 py-1 text-xs text-gray-600">
                  {label}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">All available works</span>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="featured">Featured first</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="large-first">Largest first</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((artwork) => <ArtworkTile key={artwork.id} artwork={artwork} />)
          ) : (
            <div className="col-span-full border-y py-12 text-center text-gray-500">
              <p>{emptyText}</p>
              <button
                type="button"
                onClick={() => setFilters(emptyArtworkFilters)}
                className="mt-4 text-sm underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-500">
            <PriceDisclosure />
          </p>
        )}
      </section>
    </div>
  )
}

function ArtworkTile({ artwork }: { artwork: ArtworkDiscoveryItem }) {
  return (
    <Link href={artwork.href} className="group block">
      <div className="mb-4 aspect-[4/5] overflow-hidden bg-gray-100">
        {artwork.imageUrl ? (
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">Artwork</div>
        )}
      </div>
      <p className="text-xs uppercase tracking-wider text-gray-500">
        {[artwork.category, artwork.medium].filter(Boolean).join(" / ")}
      </p>
      <h3 className="mt-1 font-medium">{artwork.title}</h3>
      <p className="text-sm text-gray-500">{artwork.artistName}</p>
      <p className="mt-1 font-semibold">
        <PriceText amountCny={artwork.price} />
      </p>
      <p className="mt-1 text-xs text-gray-400">{artwork.dimensions}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {[artwork.size, artwork.orientation, artwork.rooms[0], artwork.colors[0]].filter(Boolean).map((tag) => (
          <span key={tag} className="bg-gray-100 px-2 py-1 text-xs text-gray-500">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
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

function activeFilterLabels(filters: ArtworkFilterState) {
  return artworkFilterGroups.flatMap((group) => filters[group.key].map((value) => `${group.label}: ${value}`))
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
