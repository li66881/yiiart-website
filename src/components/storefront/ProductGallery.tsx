"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { productMediaRoleLabels, type ProductMediaItem } from "@/lib/artwork-media"
import styles from "./storefront.module.css"

type Props = {
  media: ProductMediaItem[]
  alt: string
}

export default function ProductGallery({ media, alt }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const selectedMedia = media[selectedIndex] || media[0]

  const goTo = useCallback(
    (index: number) => {
      if (!media.length) return
      const next = (index + media.length) % media.length
      setSelectedIndex(next)
      setFadeKey((value) => value + 1)
    },
    [media.length],
  )

  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex])
  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false)
      if (event.key === "ArrowLeft") goPrev()
      if (event.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, lightboxOpen])

  if (!selectedMedia) {
    return <div className={styles.galleryEmpty}>Artwork image is not available for this listing.</div>
  }

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 40) return
    if (delta > 0) goPrev()
    else goNext()
  }

  const thumbs = (
    <div className={styles.thumbnailRail} aria-label="Additional artwork views">
      {media.slice(0, 12).map((item, index) => (
        <button
          type="button"
          className={styles.thumbnail}
          key={item.id}
          aria-label={`Show ${(productMediaRoleLabels[item.role] || "image").toLowerCase()}`}
          aria-current={selectedIndex === index}
          onClick={() => goTo(index)}
        >
          {item.type === "video" ? (
            item.posterUrl ? (
              <>
                <Image src={item.posterUrl} alt="" fill sizes="88px" />
                <span className={styles.videoBadge}>Video</span>
              </>
            ) : (
              <span className={styles.videoThumbnail}>Play</span>
            )
          ) : (
            <Image src={item.url} alt="" fill sizes="88px" />
          )}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <figure className={styles.gallery}>
        <div
          className={`${styles.galleryLayout} ${media.length > 1 ? styles.galleryLayoutWithThumbs : ""}`}
        >
          {media.length > 1 ? <div className={styles.thumbnailRailDesktop}>{thumbs}</div> : null}

          <div
            className={styles.galleryStage}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div key={fadeKey} className={styles.galleryFade}>
              {selectedMedia.type === "video" ? (
                <video
                  className={styles.galleryVideo}
                  controls
                  playsInline
                  preload="metadata"
                  poster={selectedMedia.posterUrl}
                  aria-label={selectedMedia.alt || `${alt} studio video`}
                >
                  <source src={selectedMedia.url} />
                  Your browser does not support product video playback.
                </video>
              ) : (
                <button
                  type="button"
                  className={styles.galleryMainButton}
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open larger image"
                >
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || alt}
                    fill
                    priority={selectedIndex === 0}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                </button>
              )}
            </div>

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.galleryNav} ${styles.galleryNavPrev}`}
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.galleryNav} ${styles.galleryNavNext}`}
                  onClick={goNext}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.expandCue}
              onClick={() => setLightboxOpen(true)}
              aria-label="Expand image"
            >
              ⤢
            </button>

            <button
              type="button"
              className={styles.galleryRoomCue}
              onClick={() => {
                const roomIndex = media.findIndex(
                  (item) => item.role === "living_room" || item.role === "bedroom",
                )
                if (roomIndex >= 0) goTo(roomIndex)
                else setLightboxOpen(true)
              }}
            >
              View in room
            </button>
          </div>
        </div>

        {media.length > 1 ? <div className={styles.thumbnailRailMobile}>{thumbs}</div> : null}
      </figure>

      {lightboxOpen && selectedMedia.type !== "video" && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Artwork lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>
          <div className={styles.lightboxInner} onClick={(event) => event.stopPropagation()}>
            <Image
              src={selectedMedia.url}
              alt={selectedMedia.alt || alt}
              width={1600}
              height={1600}
              className={styles.lightboxImage}
            />
            {media.length > 1 && (
              <div className={styles.lightboxControls}>
                <button type="button" onClick={goPrev} aria-label="Previous image">
                  ‹
                </button>
                <span>
                  {selectedIndex + 1} / {media.length}
                </span>
                <button type="button" onClick={goNext} aria-label="Next image">
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
