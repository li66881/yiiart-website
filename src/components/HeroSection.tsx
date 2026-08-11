"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { shouldAutoplayCarousel } from "@/lib/storefront/visual-content"

export type HeroSlide = {
  imageUrl: string
  imageAlt: string
  eyebrow: string
  title: string
  subtitle: string
  ctaHref: string
  ctaLabel: string
}

type HeroSectionProps = {
  slides?: HeroSlide[]
  imageUrl?: string
  imageAlt?: string
}

export default function HeroSection({
  slides = [],
  imageUrl,
  imageAlt = "YiiArt hand-painted artwork in a modern interior",
}: HeroSectionProps) {
  const resolvedSlides = slides.length > 0
    ? slides
    : imageUrl
      ? [{
          imageUrl,
          imageAlt,
          eyebrow: "Hand-painted to order",
          title: "Art made for the room you live in.",
          subtitle: "Choose the scale, palette, and finish that feel right for your wall.",
          ctaHref: "/artworks",
          ctaLabel: "Shop all art",
        }]
      : []
  const [activeIndex, setActiveIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const slideCount = resolvedSlides.length
  const activeSlide = resolvedSlides[activeIndex] || resolvedSlides[0]
  const autoplay = shouldAutoplayCarousel({ slideCount, userPaused, hoverPaused, prefersReducedMotion })

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(motionPreference.matches)
    updatePreference()
    motionPreference.addEventListener("change", updatePreference)
    return () => motionPreference.removeEventListener("change", updatePreference)
  }, [])

  useEffect(() => {
    if (!autoplay) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount)
    }, 5600)

    return () => window.clearInterval(intervalId)
  }, [autoplay, slideCount])

  useEffect(() => {
    if (activeIndex >= slideCount && slideCount > 0) setActiveIndex(0)
  }, [activeIndex, slideCount])

  if (!activeSlide) {
    return null
  }

  return (
    <section
      className="meson-hero-shell relative mt-[var(--yiiart-header-offset)] overflow-hidden bg-[#f3efe8] py-3 sm:py-5 lg:py-7"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured YiiArt collections"
    >
      <div className="relative mx-auto min-h-[min(72svh,760px)] w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">
        <div className="relative min-h-[min(68svh,720px)] overflow-hidden rounded-[18px] bg-[#e8e1d7] shadow-[0_12px_44px_rgba(43,35,27,0.08)]">
          {resolvedSlides.map((slide, index) => (
            <div
              key={`${slide.imageUrl}-${index}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
              aria-hidden={index !== activeIndex}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/5" />

          <div className="absolute inset-y-0 right-0 z-10 flex w-full items-end sm:max-w-lg sm:items-stretch md:w-[42%]">
            <div className="m-4 flex flex-1 flex-col justify-center rounded-[14px] bg-[#f8f3eb]/95 px-6 py-7 text-[#1d1c18] shadow-[0_18px_50px_rgba(37,31,25,0.12)] backdrop-blur-md sm:m-6 sm:px-8 md:my-8 md:mr-8">
              <p className="font-[Georgia,serif] text-[1.2rem] italic tracking-wide text-[#8a6a45]">
                {activeSlide.eyebrow}
              </p>
              <h1 className="mt-3 max-w-[12ch] text-[2.35rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[2.8rem]">
                {activeSlide.title}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600 sm:text-[15px]">
                {activeSlide.subtitle}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={activeSlide.ctaHref}
                  className="inline-flex min-h-11 items-center rounded-full bg-[#1f2b24] px-7 text-xs font-semibold uppercase tracking-[0.11em] text-white transition hover:bg-[#34443a]"
                >
                  {activeSlide.ctaLabel}
                </Link>
                <Link
                  href="/custom-painting"
                  className="inline-flex min-h-11 items-center rounded-full border border-stone-400 px-6 text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-stone-700"
                >
                  Custom art
                </Link>
              </div>
            </div>
          </div>

          {slideCount > 1 ? (
            <>
              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                {resolvedSlides.map((slide, index) => (
                  <button
                    key={`${slide.imageUrl}-dot`}
                    type="button"
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={index === activeIndex}
                    className={`h-2 w-2 rounded-full border border-white/75 transition ${index === activeIndex ? "bg-white" : "bg-white/30 hover:bg-white/60"}`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={userPaused ? "Start carousel" : "Pause carousel"}
                title={prefersReducedMotion ? "Autoplay is disabled by your motion preference" : undefined}
                disabled={prefersReducedMotion}
                className="absolute bottom-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-black/25 text-sm text-white backdrop-blur-sm transition hover:bg-black/45 disabled:cursor-default disabled:opacity-55"
                onClick={() => setUserPaused((current) => !current)}
              >
                <span aria-hidden="true">{userPaused ? "\u25b6" : "\u2016"}</span>
              </button>
              <button
                type="button"
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-2xl text-white backdrop-blur-sm transition hover:bg-black/45 md:flex"
                onClick={() => setActiveIndex((current) => (current - 1 + slideCount) % slideCount)}
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-2xl text-white backdrop-blur-sm transition hover:bg-black/45 md:flex"
                onClick={() => setActiveIndex((current) => (current + 1) % slideCount)}
              >
                <span aria-hidden="true">&#8250;</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
