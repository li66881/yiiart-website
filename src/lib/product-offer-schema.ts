import { madeToOrderUsShippingDays } from "./shipping-timing"

type ProductOfferInput = {
  url: string
  sku: string
  priceCurrency: string
  price?: string
  availability: string
  standardSizeReturns?: boolean
  includedUsShipping?: boolean
}

export function buildProductOfferJsonLd({
  url,
  sku,
  priceCurrency,
  price,
  availability,
  standardSizeReturns = false,
  includedUsShipping = false,
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
  if (includedUsShipping && price) {
    offer.shippingDetails = {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: 0, currency: priceCurrency },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: madeToOrderUsShippingDays.handling.min, maxValue: madeToOrderUsShippingDays.handling.max, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: madeToOrderUsShippingDays.transit.min, maxValue: madeToOrderUsShippingDays.transit.max, unitCode: "DAY" },
      },
    }
  }
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
