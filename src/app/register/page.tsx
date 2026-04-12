"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to create account. Email may already be in use.")
        setLoading(false)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md">
        <h1 className="text-2xl font-medium text-center mb-8">{t("auth.signUp")}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.confirmPassword")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.signUp")}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="underline">
            {t("auth.signInLink")}
          </Link>
        </p>
      </div>
    </div>
  )
}
