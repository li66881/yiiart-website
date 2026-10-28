type ProductOfferInput = {
  url: string
  sku: string
  priceCurrency: string
  price?: string
  availability: string
  standardSizeReturns?: boolean
}

export function buildProductOfferJsonLd({
  url,
  sku,
  priceCurrency,
  price,
  availability,
  standardSizeReturns = false,
}: ProductOfferInput) {
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url,
    sku,
    priceCurrency,
    availability,
    itemCondition: "https://schema.org/NewCondition",
  }

  if (price) offer.price = price
  if (standardSizeReturns) {
    offer.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
      merchantReturnLink: new URL("/returns", url).toString(),
    }
  }

  return offer
}
