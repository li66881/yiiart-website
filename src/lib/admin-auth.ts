export const ADMIN_SESSION_COOKIE = "yiiart-admin-session"
const ADMIN_SESSION_MESSAGE = "yiiart-admin-access"
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

export function validateAdminAccessPassword(password: unknown) {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return {
      ok: false,
      status: 503,
      error: "Admin access is not configured. Set ADMIN_PASSWORD first.",
    }
  }

  if (typeof password !== "string" || !safeEqual(password, adminPassword)) {
    return { ok: false, status: 401, error: "Invalid admin password." }
  }

  return { ok: true, status: 200, error: "" }
}

export async function createAdminSessionToken() {
  const secret = getAdminSessionSecret()
  if (!secret) return ""

  const encoder = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(ADMIN_SESSION_MESSAGE)
  )

  return bytesToHex(new Uint8Array(signature))
}

export async function isAdminSessionToken(value: unknown) {
  const expected = await createAdminSessionToken()
  if (!expected || typeof value !== "string") return false

  return safeEqual(value, expected)
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  }
}

function getAdminSessionSecret() {
  return process.env.ADMIN_PASSWORD || ""
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return difference === 0
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
