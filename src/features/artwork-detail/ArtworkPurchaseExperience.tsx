"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowCounterClockwise,
  Camera,
  CaretRight,
  Check,
  LockKey,
  Package,
  Truck,
  WhatsappLogo,
} from "@phosphor-icons/react"
import AddToCartButton, { type AddToCartItem } from "@/components/AddToCartButton"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import ReviewStars from "@/components/ReviewStars"
import { useLanguage } from "@/context/LanguageContext"
import type { PresentationOption, ProductTag } from "./model"

type ArtworkPurchaseExperienceProps = {
  eyebrow: string
  title: string
  artistName: string
  description: string
  dimensions: string
  priceCny: number
  displayPriceOverride?: string
  reviewCount: number
  reviewOverall: number
  presentationOptions: PresentationOption[]
  presentationFallbackText?: string
  baseCartItem: AddToCartItem
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
  previewMode?: boolean
  productTags: ProductTag[]
  sizeGuideHref: string
  studioPhotoMode: "included" | "request"
}

export default function ArtworkPurchaseExperience({
  eyebrow,
  title,
  artistName,
  description,
  dimensions,
  priceCny,
  displayPriceOverride,
  reviewCount,
  reviewOverall,
  presentationOptions,
  presentationFallbackText,
  baseCartItem,
  directCheckoutAvailable,
  invoiceUrl,
  whatsappUrl,
  previewMode = false,
  productTags,
  sizeGuideHref,
  studioPhotoMode,
}: ArtworkPurchaseExperienceProps) {
  const { t } = useLanguage()
  const [selectedPresentation, setSelectedPresentation] = useState(
    presentationOptions[0]?.label,
  )
  const [previewAdded, setPreviewAdded] = useState(false)
  const cartItem = {
    ...baseCartItem,
    presentationOption: selectedPresentation,
  }
  const reassuranceRows = [
    {
      title: t("product.oneOfAKind"),
      text: "A physical artwork selected for a single collector.",
      icon: Package,
    },
    {
      title: t("product.worldwideDelivery"),
      text: "Carefully packed for the safest practical delivery format.",
      icon: Truck,
    },
    {
      title: t("product.returnWindow"),
      text: "Eligible ready-made artwork follows YiiArt's published return policy.",
      icon: ArrowCounterClockwise,
    },
    {
      title: "Secure payment",
      text: "Checkout and invoice options use YiiArt's configured payment providers.",
      icon: LockKey,
    },
  ]

  const purchaseAction = previewMode ? (
    <button
      type="button"
      onClick={() => setPreviewAdded(true)}
      className="min-h-12 w-full bg-[#181613] px-5 py-3 text-center font-medium text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2"
    >
      {previewAdded ? "Added to prototype cart" : "Add to cart"}
    </button>
  ) : directCheckoutAvailable ? (
    <AddToCartButton item={cartItem} />
  ) : (
    <a
      href={invoiceUrl}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-12 w-full items-center justify-center bg-[#181613] px-5 py-3 text-center font-medium text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2"
    >
      Request an invoice
    </a>
  )

  return (
    <>
      <aside className="text-[#181613] lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-[0.12em] text-[#8a765f]">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-5xl font-light leading-[0.98] tracking-[-0.025em] lg:text-[3rem]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#6f675d]">by {artistName}</p>
        <p className="mt-3 max-w-xl text-sm leading-5 text-[#6f675d]">{description}</p>

        <div className="mt-4 border-b border-[#ded8ce] pb-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="text-2xl font-medium">
              {displayPriceOverride || <PriceText amountCny={priceCny} />}
            </div>
            {!displayPriceOverride && <PriceDisclosure className="max-w-[15rem] text-right text-[11px] leading-4 text-[#6f675d]" />}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-[#ded8ce] py-3">
          {productTags.map((tag) => (
            <span key={tag.label} className="text-xs text-[#6f675d]">{tag.label}</span>
          ))}
        </div>

        <div className="border-b border-[#ded8ce] py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.13em] text-[#6f675d]">{t("product.selectedSize")}</p>
            <Link href={sizeGuideHref} className="text-xs underline underline-offset-4">Size &amp; room guide</Link>
          </div>
          <div className="mt-2 flex min-h-11 items-center justify-between border border-[#ded8ce] px-3 text-sm font-medium">
            <span>{dimensions}</span>
            <CaretRight size={16} aria-hidden="true" />
          </div>
        </div>

        <div className="py-3">
          <p className="text-xs uppercase tracking-[0.13em] text-[#6f675d]">{t("product.chooseFinish")}</p>
          {presentationOptions.length > 0 ? (
            <div className="mt-2 space-y-2">
              {presentationOptions.map((option) => {
                const selected = selectedPresentation === option.label
                return (
                  <button
                    key={option.label}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={selected}
                    onClick={() => setSelectedPresentation(option.label)}
                    className={`flex min-h-[4.25rem] w-full items-center gap-3 border px-2 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2 ${selected ? "border-[#181613] bg-[#f7f5ef]" : "border-[#ded8ce] hover:border-[#181613]"}`}
                  >
                    {option.image && <img src={option.image} alt={option.label} className="h-12 w-20 shrink-0 object-cover" />}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{option.label}</span>
                      {option.description && <span className="mt-0.5 block text-xs text-[#6f675d]">{option.description}</span>}
                    </span>
                    {selected
                      ? <Check size={18} aria-hidden="true" />
                      : <CaretRight size={18} aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#6f675d]">{presentationFallbackText || t("product.confirmPresentation")}</p>
          )}
        </div>

        <div className="mb-3 flex gap-3 border border-[#cfd6c8] bg-[#f3f5ef] px-3 py-3 text-sm">
          <Camera size={20} aria-hidden="true" className="shrink-0" />
          <div>
            <p className="font-medium">
              {studioPhotoMode === "included"
                ? "We send studio photos before shipping."
                : "Request studio photos before shipping."}
            </p>
            <p className="mt-1 text-xs text-[#6f675d]">Review the surface and framing before dispatch.</p>
          </div>
        </div>

        <div className="hidden space-y-2 lg:block">
          {purchaseAction}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-10 items-center justify-center gap-2 border-b border-[#ded8ce] px-4 py-2 text-center text-sm underline underline-offset-4 transition hover:bg-[#f1eee7] focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2"
          >
            <WhatsappLogo size={18} aria-hidden="true" />
            Ask on WhatsApp
          </a>
        </div>

        <div className="mt-2 hidden divide-y divide-[#ded8ce] border-t border-[#ded8ce] text-sm lg:block">
          {reassuranceRows.map((row, index) => {
            const Icon = row.icon
            return (
              <details key={row.title} className="group py-2" open={index < 2}>
                <summary className="flex cursor-pointer list-none items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2">
                  <Icon size={18} aria-hidden="true" className="shrink-0 text-[#6f675d]" />
                  <span className="flex-1 font-medium">{row.title}</span>
                  <CaretRight size={16} aria-hidden="true" className="transition group-open:rotate-90" />
                </summary>
                <p className="ml-7 mt-1 text-xs leading-5 text-[#6f675d]">{row.text}</p>
              </details>
            )
          })}
        </div>

        {reviewCount > 0 && reviewOverall > 0 && (
          <div className="mt-3 hidden items-center gap-2 text-xs text-[#6f675d] lg:flex">
            <ReviewStars rating={reviewOverall} size="sm" />
            <span>{reviewOverall.toFixed(1)} from {reviewCount} verified collector {reviewCount === 1 ? "review" : "reviews"}</span>
          </div>
        )}
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ded8ce] bg-[#fbfaf6]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(24,22,19,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-[#6f675d]">{selectedPresentation || dimensions}</p>
            <p className="font-medium">{displayPriceOverride || <PriceText amountCny={priceCny} />}</p>
          </div>
          <div className="w-[52%]">{purchaseAction}</div>
        </div>
      </div>
    </>
  )
}
