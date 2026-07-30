"use client"

import { useLanguage } from "@/context/LanguageContext"

type TrustBadge = {
  titleKey: string
  textKey: string
  value?: string
  valueKey?: string
}

const badges: TrustBadge[] = [
  { value: "100%", titleKey: "trust.original", textKey: "trust.originalDesc" },
  { valueKey: "cart.free", titleKey: "trust.shipping", textKey: "trust.shippingDesc" },
  { value: "30", titleKey: "trust.trial", textKey: "trust.trialDesc" },
  { value: "80%", titleKey: "trust.support", textKey: "trust.supportDesc" },
]

export default function TrustSection() {
  const { t } = useLanguage()

  return (
    <section className="border-b border-stone-200 bg-[#fbfaf6]">
      <div className="mx-auto grid max-w-[1440px] gap-0 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-10">
        {badges.map((badge) => (
          <div key={badge.titleKey} className="border-stone-200 py-5 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
            <p className="text-3xl font-light text-black">{badge.valueKey ? t(badge.valueKey) : badge.value}</p>
            <h3 className="mt-2 font-medium text-stone-950">{t(badge.titleKey)}</h3>
            <p className="mt-1 text-sm leading-6 text-stone-600">{t(badge.textKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
