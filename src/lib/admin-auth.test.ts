import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  isAdminSessionToken,
  validateAdminAccessPassword,
} from "./admin-auth"

test("admin unlock validates ADMIN_PASSWORD without requiring publishing configuration", () => {
  const originalEnv = { ...process.env }

  try {
    process.env.ADMIN_PASSWORD = "correct-password"
    delete process.env.SANITY_WRITE_TOKEN

    assert.deepEqual(validateAdminAccessPassword("wrong-password"), {
      ok: false,
      status: 401,
      error: "Invalid admin password.",
    })

    assert.deepEqual(validateAdminAccessPassword("correct-password"), {
      ok: true,
      status: 200,
      error: "",
    })
  } finally {
    process.env = originalEnv
  }
})

test("admin session cookie is signed and scoped to admin routes", async () => {
  const originalEnv = { ...process.env }

  try {
    process.env.ADMIN_PASSWORD = "correct-password"

    const token = await createAdminSessionToken()
    const options = getAdminSessionCookieOptions()

    assert.equal(ADMIN_SESSION_COOKIE, "yiiart-admin-session")
    assert.ok(token)
    assert.equal(await isAdminSessionToken(token), true)
    assert.equal(await isAdminSessionToken("unlocked"), false)
    assert.equal(options.httpOnly, true)
    assert.equal(options.sameSite, "lax")
    assert.equal(options.path, "/admin")
  } finally {
    process.env = originalEnv
  }
})

test("admin layout gates children behind the admin session cookie", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "app", "admin", "layout.tsx"), "utf8")

  assert.match(source, /cookies\(/)
  assert.match(source, /ADMIN_SESSION_COOKIE/)
  assert.match(source, /isAdminSessionToken/)
  assert.match(source, /AdminUnlockForm/)
})

test("middleware intercepts locked admin pages before route rendering", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "middleware.ts"), "utf8")

  assert.match(source, /matcher:\s*\[\s*"\/admin\/:path\*"/)
  assert.match(source, /ADMIN_SESSION_COOKIE/)
  assert.match(source, /isAdminSessionToken/)
  assert.match(source, /"\/admin-unlock"/)
})
