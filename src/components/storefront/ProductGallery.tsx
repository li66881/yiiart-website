"use client"

import Image from "next/image"
import { useEffect, useRef, useState, type WheelEvent } from "react"
import { productMediaRoleLabels, type ProductMediaItem } from "@/lib/artwork-media"
import styles from "./storefront.module.css"

type Props = {
  media: ProductMediaItem[]
  alt: string
}

const roomSceneRoles = new Set(["living_room", "bedroom", "dining_room"])

export default function ProductGallery({ media, alt }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const lightboxCloseRef = useRef<HTMLButtonElement>(null)
  const selectedMedia = media[selectedIndex] || media[0]

  const showPrevious = () => {
    setSelectedIndex((current) => (current - 1 + media.length) % media.length)
    setZoom(1)
  }
  const showNext = () => {
    setSelectedIndex((current) => (current + 1) % media.length)
    setZoom(1)
  }

  useEffect(() => {
    if (!lightboxOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const focusTimer = window.setTimeout(() => lightboxCloseRef.current?.focus(), 0)
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false)
      if (event.key === "ArrowLeft") showPrevious()
      if (event.key === "ArrowRight") showNext()
      if (event.key === "Tab") {
        const focusable = Array.from(
          lightboxRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') || [],
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused) previouslyFocused.focus()
    }
  }, [lightboxOpen, media.length])

  if (!selectedMedia) {
    return <div className={styles.galleryEmpty}>Artwork image is not available for this listing.</div>
  }

  const selectMedia = (index: number) => {
    setSelectedIndex(index)
    setZoom(1)
  }
  const handleZoom = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    setZoom((current) => Math.min(2.5, Math.max(1, current + (event.deltaY < 0 ? 0.2 : -0.2))))
  }

  return (
    <figure className={styles.gallery} aria-label="Artwork gallery">
      {media.length > 1 ? (
        <div className={styles.thumbnailGrid} aria-label="Additional artwork views">
          {media.slice(0, 10).map((item, index) => (
            <button
              type="button"
              className={styles.thumbnail}
              key={item.id}
              aria-label={`Show ${productMediaRoleLabels[item.role].toLowerCase()}`}
              aria-pressed={selectedIndex === index}
              data-room-scene={roomSceneRoles.has(item.role) || undefined}
              onClick={() => selectMedia(index)}
            >
              {item.type === "video" ? (
                item.posterUrl ? (
                  <>
                    <Image src={item.posterUrl} alt="" fill sizes="96px" />
                    <span className={styles.videoBadge}>Video</span>
                  </>
                ) : (
                  <span className={styles.videoThumbnail}>Play video</span>
                )
              ) : (
                <Image src={item.url} alt="" fill sizes="96px" />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.galleryMain}>
        <div className={styles.galleryStage}>
          {selectedMedia.type === "video" ? (
            <video
              key={selectedMedia.url}
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
              className={styles.galleryImageButton}
              aria-label="Open artwork image viewer"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.alt || alt}
                fill
                priority={selectedIndex === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <span className={styles.zoomHint}>View larger</span>
            </button>
          )}

          {media.length > 1 ? (
            <>
              <button type="button" className={`${styles.galleryArrow} ${styles.galleryArrowPrevious}`} aria-label="Previous artwork view" onClick={showPrevious}>
                <span aria-hidden="true">&#8249;</span>
              </button>
              <button type="button" className={`${styles.galleryArrow} ${styles.galleryArrowNext}`} aria-label="Next artwork view" onClick={showNext}>
                <span aria-hidden="true">&#8250;</span>
              </button>
            </>
          ) : null}
        </div>
        <figcaption>
          <span>{productMediaRoleLabels[selectedMedia.role]}</span>
          <span>{selectedIndex + 1} / {media.length}</span>
        </figcaption>
      </div>

      {lightboxOpen && selectedMedia.type === "image" ? (
        <div ref={lightboxRef} className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Artwork image viewer" tabIndex={-1}>
          <button ref={lightboxCloseRef} type="button" className={styles.lightboxClose} aria-label="Close artwork image viewer" onClick={() => setLightboxOpen(false)}>x</button>
          <div className={styles.lightboxStage} onWheel={handleZoom}>
            <Image
              src={selectedMedia.url}
              alt={selectedMedia.alt || alt}
              fill
              sizes="100vw"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
          <p>Use the mouse wheel to inspect texture</p>
          {media.length > 1 ? (
            <>
              <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxPrevious}`} aria-label="Previous artwork view" onClick={showPrevious}>&#8249;</button>
              <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxNext}`} aria-label="Next artwork view" onClick={showNext}>&#8250;</button>
            </>
          ) : null}
        </div>
      ) : null}
    </figure>
  )
}
