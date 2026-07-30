export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
}

export function getPayPalApiBase() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.")
  }

  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal.")
  }

  const data = await response.json()
  return data.access_token as string
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to capture PayPal order.")
  }

  return response.json()
}

export async function verifyPayPalWebhookSignature(headers: Headers, webhookEvent: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID is not configured.")
  }

  const payload = {
    auth_algo: requiredHeader(headers, "paypal-auth-algo"),
    cert_url: requiredHeader(headers, "paypal-cert-url"),
    transmission_id: requiredHeader(headers, "paypal-transmission-id"),
    transmission_sig: requiredHeader(headers, "paypal-transmission-sig"),
    transmission_time: requiredHeader(headers, "paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: webhookEvent,
  }

  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("PayPal webhook signature verification failed.")
  }

  const data = await response.json()
  return data.verification_status === "SUCCESS"
}

function requiredHeader(headers: Headers, name: string) {
  const value = headers.get(name)
  if (!value) {
    throw new Error(`Missing PayPal webhook header: ${name}`)
  }
  return value
}
