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
    <section className="bg-gray-50 py-14">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.titleKey}>
            <div className="mb-2 text-3xl font-light">{badge.valueKey ? t(badge.valueKey) : badge.value}</div>
            <h3 className="font-semibold">{t(badge.titleKey)}</h3>
            <p className="text-sm text-gray-500">{t(badge.textKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
