"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import HomeProductCard from "@/components/home/HomeProductCard"
import { normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"

type Props = {
  artworks: any[]
}

const STYLE_TABS = [
  { id: "All", match: [] as string[] },
  { id: "Abstract", match: ["abstract"] },
  { id: "Textured", match: ["texture", "textured", "plaster"] },
  { id: "Minimalist", match: ["minimal"] },
  { id: "Large", match: ["large", "oversized"] },
] as const

function searchText(artwork: any) {
  return [
    pickEnglish(artwork.title),
    normalizeCategory(artwork.category),
    normalizeMedium(artwork.medium),
    ...(Array.isArray(artwork.tags) ? artwork.tags : []),
  ]
    .join(" ")
    .toLowerCase()
}

export default function BestSellerTabs({ artworks }: Props) {
  const tabs = useMemo(
    () => STYLE_TABS.filter((tab) => tab.id === "All" || artworks.some((artwork) => tab.match.some((term) => searchText(artwork).includes(term)))),
    [artworks],
  )
  const [active, setActive] = useState("All")

  const visible = useMemo(() => {
    const tab = STYLE_TABS.find((item) => item.id === active)
    const list =
      !tab || tab.id === "All"
        ? artworks
        : artworks.filter((artwork) => tab.match.some((term) => searchText(artwork).includes(term)))
    return list.slice(0, 8)
  }, [active, artworks])

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-heading)] text-[28px] font-light tracking-[-0.03em] text-[#171717] md:text-[36px]">
          Best Seller
        </h2>
        <Link href="/artworks?sort=featured" className="text-[14px] text-[#171717] underline-offset-4 hover:underline">
          View all
        </Link>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Best seller styles">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`h-9 shrink-0 px-4 text-[13px] transition ${
              active === tab.id
                ? "bg-[#171717] text-white"
                : "border border-[#e5e5e5] bg-white text-[#171717] hover:border-[#171717]"
            }`}
          >
            {tab.id}
          </button>
        ))}
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {visible.map((artwork, index) => (
          <div key={artwork._id} className="w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-auto">
            <HomeProductCard artwork={artwork} badge={index < 2 ? "bestseller" : null} />
          </div>
        ))}
      </div>
    </div>
  )
}
