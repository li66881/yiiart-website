import Stripe from "stripe"

// Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set
let stripeInstance: Stripe | null = null

export const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    stripeInstance = new Stripe(key, {
      typescript: true,
    })
  }
  return stripeInstance
}

// Alias for backwards compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout
  },
}
