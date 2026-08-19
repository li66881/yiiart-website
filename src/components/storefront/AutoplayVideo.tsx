"use client"

import { useEffect, useRef } from "react"
import { shouldPlayInlineVideo } from "@/lib/storefront/visual-content"

type AutoplayVideoProps = {
  src: string
  poster?: string
  className?: string
  preload?: "none" | "metadata" | "auto"
  "aria-label"?: string
}

export default function AutoplayVideo({
  src,
  poster,
  className,
  preload = "metadata",
  "aria-label": ariaLabel,
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPlayback = (isIntersecting: boolean, intersectionRatio: number) => {
      const shouldPlay = shouldPlayInlineVideo({
        isIntersecting,
        intersectionRatio,
        prefersReducedMotion: motionPreference.matches,
      })
      if (shouldPlay) {
        const playAttempt = video.play()
        if (playAttempt) playAttempt.catch(() => undefined)
        return
      }
      video.pause()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        syncPlayback(entry.isIntersecting, entry.intersectionRatio)
      },
      { threshold: [0, 0.2, 0.35, 0.6] },
    )

    const onCanPlay = () => {
      const rect = video.getBoundingClientRect()
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
      const visibleRatio = rect.height > 0 ? visibleHeight / rect.height : 0
      syncPlayback(visibleRatio >= 0.2, visibleRatio)
    }

    observer.observe(video)
    video.addEventListener("canplay", onCanPlay)
    onCanPlay()

    return () => {
      observer.disconnect()
      video.removeEventListener("canplay", onCanPlay)
      video.pause()
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      preload={preload}
      poster={poster}
      src={src}
      aria-label={ariaLabel}
    />
  )
}
