// Confirmed typical estimates for eligible made-to-order direct-checkout works.
// Framed/invoice-only presentations still require destination-specific confirmation.
const madeToOrderHandlingDays = { min: 6, max: 8 } as const

export const madeToOrderShippingDestinations = [
  { country: "US", handling: madeToOrderHandlingDays, transit: { min: 3, max: 5 } },
  { country: "AU", handling: madeToOrderHandlingDays, transit: { min: 4, max: 6 } },
] as const

export const madeToOrderUsShippingDays = madeToOrderShippingDestinations[0]
export const madeToOrderAuShippingDays = madeToOrderShippingDestinations[1]
export const shippingBusinessDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
