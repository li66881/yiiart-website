"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t("auth.invalidCredentials"))
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
        <h1 className="text-2xl font-medium text-center mb-8">{t("common.login")}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.signIn")}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="underline">
            {t("auth.createOne")}
          </Link>
        </p>
        
        <div className="mt-6 p-4 bg-gray-50 text-sm">
          <p className="font-medium mb-2">{t("auth.demoAccount")}</p>
          <p>{t("auth.email")}: demo@yiiart.com</p>
          <p>{t("auth.password")}: demo123</p>
        </div>
      </div>
    </div>
  )
}
