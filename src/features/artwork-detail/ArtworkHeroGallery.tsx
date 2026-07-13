"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import type { ArtworkGalleryItem } from "./model"

export default function ArtworkHeroGallery({ items }: { items: ArtworkGalleryItem[] }) {
  const initialIndex = Math.max(0, items.findIndex((item) => item.role === "room"))
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([])

  if (items.length === 0) return null

  const selected = items[selectedIndex] || items[0]

  const selectAndFocus = (index: number) => {
    const normalizedIndex = (index + items.length) % items.length
    setSelectedIndex(normalizedIndex)
    thumbnailRefs.current[normalizedIndex]?.focus()
  }

  const handleThumbnailKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      selectAndFocus(index + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      selectAndFocus(index - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      selectAndFocus(0)
    } else if (event.key === "End") {
      event.preventDefault()
      selectAndFocus(items.length - 1)
    }
  }

  return (
    <section aria-label="Artwork gallery" className="min-w-0">
      <div
        data-gallery-layout="natural-studio"
        className={`grid min-w-0 gap-3 lg:gap-4 ${items.length > 1 ? "lg:grid-cols-[6.5rem_minmax(0,1fr)]" : "lg:grid-cols-1"}`}
      >
        {items.length > 1 && (
          <div
            className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:overflow-visible lg:pb-0"
            role="group"
            aria-label="Artwork views"
          >
            {items.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                ref={(node) => { thumbnailRefs.current[index] = node }}
                type="button"
                aria-label={`Show ${item.alt}`}
                aria-pressed={selectedIndex === index}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(event) => handleThumbnailKeyDown(event, index)}
                className={`h-24 w-20 shrink-0 border bg-[#f1eee7] p-1 transition lg:h-[7.25rem] lg:w-full focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2 ${selectedIndex === index ? "border-[#181613] opacity-100" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative order-1 aspect-[4/3] overflow-hidden bg-[#f1eee7] lg:order-2 lg:aspect-auto lg:min-h-[calc(100vh-7rem)]">
          <img
            key={selected.url}
            src={selected.url}
            alt={selected.alt}
            className={selected.role === "room" ? "h-full w-full object-cover" : "h-full w-full object-contain"}
          />
          {selected.isVisualization && (
            <span className="absolute bottom-3 left-3 bg-[#fbfaf6]/95 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#181613]">
              Room visualization
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
