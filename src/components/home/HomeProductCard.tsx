"use client"

import Image from "next/image"
import Link from "next/link"
import type { MouseEvent } from "react"
import { PriceText } from "@/components/PriceText"
import AutoplayVideo from "@/components/storefront/AutoplayVideo"
import { useWishlist } from "@/context/WishlistContext"
import { formatArtworkDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls } from "@/lib/artwork-images"
import { getArtworkVideo } from "@/lib/storefront/visual-content"

type Props = {
  artwork: any
  badge?: "bestseller" | "new" | null
  compact?: boolean
}

export default function HomeProductCard({ artwork, badge = null, compact = false }: Props) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const id = artwork._id
  const slug = artwork.slug?.current || artwork._id
  const href = `/artwork/${slug}`
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const artist = pickEnglish(artwork.artist?.name, "YiiArt")
  const images = getArtworkImageUrls(artwork, { width: 1400, height: 1750 })
  const primary = images[0] || getArtworkImageUrl(artwork, { width: 1400, height: 1750 })
  const secondary = images[1]
  const video = getArtworkVideo(artwork)
  const meta = [normalizeCategory(artwork.category), normalizeMedium(artwork.medium)].filter(Boolean).join(" / ")
  const saved = isInWishlist(id)
  const fromPrice = typeof artwork.price === "number"

  const onWishlist = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!primary) return
    toggleWishlist({
      id,
      slug,
      title,
      artist,
      price: artwork.price || 0,
      image: primary,
    })
  }

  return (
    <article className="group min-w-0">
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f0eee8]">
          {primary ? (
            <>
              {video?.url ? (
                <AutoplayVideo
                  className="absolute inset-0 h-full w-full object-cover"
                  poster={video.posterUrl || primary}
                  src={video.url}
                />
              ) : (
                <>
                  <Image
                    src={primary}
                    alt={`${title}, hand-painted canvas art`}
                    fill
                    quality={90}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className={`object-cover transition-opacity duration-300 ${secondary ? "group-hover:opacity-0" : "transition-transform duration-500 group-hover:scale-[1.02]"}`}
                  />
                  {secondary && (
                    <Image
                      src={secondary}
                      alt={`${title}, alternate view`}
                      fill
                      quality={90}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#a4a4a4]">
              Image on request
            </div>
          )}

          {badge && (
            <span
              className={`yii-badge absolute left-3 top-3 ${
                badge === "bestseller" ? "yii-badge-bestseller" : "yii-badge-sale"
              }`}
            >
              {badge === "bestseller" ? "Bestseller" : "New"}
            </span>
          )}

          <button
            type="button"
            onClick={onWishlist}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={saved}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#1d1d1d] transition hover:bg-white"
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
        </div>

        <div className="grid gap-1.5 pt-3">
          {meta && <p className="text-[12px] text-[#a4a4a4]">{meta}</p>}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[16px] font-medium leading-snug text-[#1d1d1d]">{title}</h3>
            <p className="shrink-0 text-right text-[16px] font-medium text-[#1d1d1d]">
              {fromPrice ? (
                <>
                  <span className="text-[12px] font-normal text-[#a4a4a4]">From </span>
                  <PriceText amountCny={artwork.price} />
                </>
              ) : (
                "Price on request"
              )}
            </p>
          </div>
          <p className="text-[13px] text-[#a4a4a4]">
            {compact ? artist : formatArtworkDimensions(artwork) || artist}
          </p>
          <span className="pt-1 text-[13px] font-medium text-[#1d1d1d] underline-offset-4 group-hover:underline">
            Choose options
          </span>
        </div>
      </Link>
    </article>
  )
}
