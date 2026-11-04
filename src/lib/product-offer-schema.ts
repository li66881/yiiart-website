import { madeToOrderShippingDestinations, shippingBusinessDays } from "./shipping-timing"

type ProductOfferInput = {
  url: string
  sku: string
  priceCurrency: string
  price?: string
  availability: string
  standardSizeReturns?: boolean
  includedStandardShipping?: boolean
}

export function buildProductOfferJsonLd({
  url,
  sku,
  priceCurrency,
  price,
  availability,
  standardSizeReturns = false,
  includedStandardShipping = false,
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
  if (includedStandardShipping && price) {
    offer.shippingDetails = madeToOrderShippingDestinations.map(({ country, handling, transit }) => ({
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: 0, currency: priceCurrency },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: country },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        businessDays: shippingBusinessDays.map((day) => `https://schema.org/${day}`),
        handlingTime: { "@type": "QuantitativeValue", minValue: handling.min, maxValue: handling.max, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: transit.min, maxValue: transit.max, unitCode: "DAY" },
      },
    }))
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
