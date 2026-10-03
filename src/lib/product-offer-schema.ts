type ProductOfferInput = {
  url: string
  sku: string
  priceCurrency: string
  price?: string
  availability: string
}

export function buildProductOfferJsonLd({
  url,
  sku,
  priceCurrency,
  price,
  availability,
}: ProductOfferInput) {
  const offer: Record<string, string> = {
    "@type": "Offer",
    url,
    sku,
    priceCurrency,
    availability,
    itemCondition: "https://schema.org/NewCondition",
  }

  if (price) offer.price = price

  return offer
}
