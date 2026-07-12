"use client"

import { useState } from "react"
import AddToCartButton, { type AddToCartItem } from "@/components/AddToCartButton"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import ReviewStars from "@/components/ReviewStars"
import { useLanguage } from "@/context/LanguageContext"
import type { PresentationOption } from "./model"

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
  presentationFallbackText: string
  baseCartItem: AddToCartItem
  directCheckoutAvailable: boolean
  invoiceUrl: string
  whatsappUrl: string
  previewMode?: boolean
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
  const trustRows = [
    t("product.oneOfAKind"),
    t("product.certificateIncluded"),
    t("product.worldwideDelivery"),
    t("product.returnWindow"),
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
        {reviewCount > 0 && reviewOverall > 0 && (
          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm">
            <span>{reviewOverall.toFixed(1)} · {reviewCount} verified collector {reviewCount === 1 ? "review" : "reviews"}</span>
            <ReviewStars rating={reviewOverall} size="sm" />
          </div>
        )}

        <p className="text-sm text-[#6f675d]">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-5xl font-light leading-[0.98] tracking-[-0.025em] lg:text-[3.45rem]">
          {title}
        </h1>
        <p className="mt-4 text-base text-[#6f675d]">by {artistName}</p>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#6f675d]">{description}</p>

        <div className="mt-7 border-y border-[#ded8ce] py-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="text-2xl font-medium">
              {displayPriceOverride || <PriceText amountCny={priceCny} />}
            </div>
            {!displayPriceOverride && <PriceDisclosure className="max-w-[15rem] text-right text-[11px] leading-4 text-[#6f675d]" />}
          </div>
        </div>

        <div className="border-b border-[#ded8ce] py-5">
          <p className="text-xs uppercase tracking-[0.13em] text-[#6f675d]">{t("product.selectedSize")}</p>
          <p className="mt-2 text-sm font-medium">{dimensions}</p>
        </div>

        <div className="py-5">
          <p className="text-xs uppercase tracking-[0.13em] text-[#6f675d]">{t("product.chooseFinish")}</p>
          {presentationOptions.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {presentationOptions.map((option) => {
                const selected = selectedPresentation === option.label
                return (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedPresentation(option.label)}
                    className={`min-h-12 border px-3 py-3 text-left text-xs leading-4 transition focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2 ${selected ? "border-[#181613] bg-[#f1eee7] font-medium" : "border-[#ded8ce] hover:border-[#181613]"}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#6f675d]">{presentationFallbackText}</p>
          )}
        </div>

        <div className="hidden space-y-3 lg:block">
          {purchaseAction}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center border border-[#181613] px-4 py-3 text-center text-sm font-medium transition hover:bg-[#f1eee7] focus:outline-none focus:ring-2 focus:ring-[#181613] focus:ring-offset-2"
          >
            {t("product.askWhatsApp")}
          </a>
        </div>

        <div className="mt-5 hidden divide-y divide-[#ded8ce] border-t border-[#ded8ce] text-sm text-[#6f675d] lg:block">
          {trustRows.map((row) => <p key={row} className="py-3">{row}</p>)}
        </div>
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
