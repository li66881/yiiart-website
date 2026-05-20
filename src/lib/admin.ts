export function getAdminConfigStatus() {
  return {
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    sanityWriteToken: Boolean(process.env.SANITY_WRITE_TOKEN),
    sanityProject: Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    newsletter: Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY),
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
