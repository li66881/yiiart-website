import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  validateAdminAccessPassword,
} from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let password: unknown

  try {
    const body = await request.json()
    password = body?.password
  } catch {
    return NextResponse.json({ success: false, error: "Invalid unlock request." }, { status: 400 })
  }

  const validation = validateAdminAccessPassword(password)
  if (!validation.ok) {
    return NextResponse.json({ success: false, error: validation.error }, { status: validation.status })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSessionToken(),
    getAdminSessionCookieOptions()
  )
  return response
}
