import { getPaymentConfigStatus } from "@/lib/payment-config"

export function getAdminConfigStatus() {
  const payment = getPaymentConfigStatus()

  return {
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    sanityWriteToken: Boolean(process.env.SANITY_WRITE_TOKEN),
    sanityProject: Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i"),
    orderStorage: payment.orderStorage,
    orderStorageProvider: payment.orderStorageProvider,
    manualInvoice: payment.manualInvoice.enabled,
    manualInvoiceStorage: payment.manualInvoice.canCreateOrder,
    stripe: payment.stripe.enabled,
    stripeConfigured: payment.stripe.configured,
    stripeWebhook: payment.stripe.webhookConfigured,
    paypal: payment.paypal.enabled,
    paypalConfigured: payment.paypal.configured,
    paypalWebhook: payment.paypal.webhookConfigured,
    newsletter: Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.SANITY_WRITE_TOKEN),
    r2MediaPublic: Boolean(process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL || process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "https://assets.yiiart.com"),
    r2MediaUpload: Boolean(
      (
        process.env.CLOUDFLARE_R2_ACCOUNT_ID
        || process.env.CLOUDFLARE_ACCOUNT_ID
      )
      && (
        process.env.CLOUDFLARE_R2_BUCKET
        || process.env.R2_BUCKET_NAME
      )
      && (
        (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY)
        || process.env.CLOUDFLARE_API_TOKEN
      )
    ),
    analytics: Boolean(process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-8B8R7YY67Q"),
    socialPixels: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_PINTEREST_TAG_ID),
  }
}

export function adminMutationError(error: any, fallback: string) {
  const responseBody = typeof error?.responseBody === "string" ? error.responseBody : ""
  const message = typeof error?.message === "string" ? error.message : ""
  const permission = error?.statusCode === 403
    || responseBody.includes("insufficientPermissionsError")
    || message.includes("Insufficient permissions")

  if (permission) {
    return {
      status: 403,
      error: "Sanity token permission is too low. Create a new Sanity API token with Editor/create permission, then replace SANITY_WRITE_TOKEN.",
    }
  }

  return {
    status: 500,
    error: message || fallback,
  }
}

export function validateAdminPublishing(password: unknown) {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || !process.env.SANITY_WRITE_TOKEN) {
    return {
      ok: false,
      status: 503,
      error: "Admin publishing is not configured. Set ADMIN_PASSWORD and SANITY_WRITE_TOKEN first.",
    }
  }

  if (typeof password !== "string" || password !== adminPassword) {
    return { ok: false, status: 401, error: "Invalid admin password." }
  }

  return { ok: true, status: 200, error: "" }
}

export function createSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || `item-${Date.now()}`
}

export function stringField(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === "string" ? value.trim() : ""
}
