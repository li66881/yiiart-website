import { isPayPalConfigured } from "@/lib/paypal"
import { isOrderStorageConfigured } from "@/lib/supabase-admin"

export function isManualInvoiceEnabled() {
  return process.env.ENABLE_MANUAL_INVOICE_REQUESTS !== "false"
}

export function isPayPalCheckoutEnabled() {
  return (
    process.env.ENABLE_PAYPAL_CHECKOUT !== "false"
    && isPayPalConfigured()
    && isOrderStorageConfigured()
  )
}

export function isStripeCheckoutEnabled() {
  const secretKey = process.env.STRIPE_SECRET_KEY || ""

  return (
    process.env.ENABLE_STRIPE_CHECKOUT === "true"
    && Boolean(secretKey)
    && !secretKey.includes("your_stripe")
    && isOrderStorageConfigured()
  )
}

export function getPaymentConfigStatus() {
  const orderStorage = isOrderStorageConfigured()
  const paypalConfigured = isPayPalConfigured()
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""
  const stripeConfigured = Boolean(stripeSecretKey) && !stripeSecretKey.includes("your_stripe")

  return {
    orderStorage,
    manualInvoice: {
      enabled: isManualInvoiceEnabled(),
      canCreateOrder: orderStorage,
    },
    paypal: {
      configured: paypalConfigured,
      enabled: isPayPalCheckoutEnabled(),
      webhookConfigured: Boolean(process.env.PAYPAL_WEBHOOK_ID),
      environment: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox",
    },
    stripe: {
      configured: stripeConfigured,
      enabled: isStripeCheckoutEnabled(),
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    },
    futureProviders: {
      airwallex: {
        enabled: false,
        label: "Airwallex",
      },
      pingpong: {
        enabled: false,
        label: "PingPong Checkout",
      },
    },
  }
}
