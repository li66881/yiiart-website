"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import { useLanguage } from "@/context/LanguageContext"

type Tab = "orders" | "artworks" | "artists" | "settings"

export default function AdminPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("orders")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Demo data
  const orders = [
    { id: "YII1234567890", customer: "Zhang Wei", items: 2, total: 28600, status: "Processing", date: "2024-01-15" },
    { id: "YII1234567891", customer: "Li Ming", items: 1, total: 15800, status: "Shipped", date: "2024-01-14" },
    { id: "YII1234567892", customer: "Wang Fang", items: 3, total: 42000, status: "Delivered", date: "2024-01-13" },
  ]

  const stats = {
    totalOrders: 156,
    pendingOrders: 12,
    totalRevenue: 456800,
    totalArtworks: 89,
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo login
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Invalid credentials. Use admin/admin123")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full px-6 py-8 bg-white shadow-md">
          <h1 className="text-2xl font-medium text-center mb-8">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border focus:outline-none focus:ring-1"
                required
              />
            </div>
            <button type="submit" className="w-full py-2 bg-black text-white hover:bg-gray-800">
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Demo: admin / admin123</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">Admin Dashboard</h1>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 border">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-medium">{stats.totalOrders}</p>
            </div>
            <div className="bg-white p-6 border">
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-medium text-orange-500">{stats.pendingOrders}</p>
            </div>
            <div className="bg-white p-6 border">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-medium">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 border">
              <p className="text-sm text-gray-500">Artworks</p>
              <p className="text-2xl font-medium">{stats.totalArtworks}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-2 px-4 ${activeTab === "orders" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("artworks")}
              className={`pb-2 px-4 ${activeTab === "artworks" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Artworks
            </button>
            <button
              onClick={() => setActiveTab("artists")}
              className={`pb-2 px-4 ${activeTab === "artists" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Artists
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-2 px-4 ${activeTab === "settings" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Settings
            </button>
          </div>

          {/* Orders Table */}
          {activeTab === "orders" && (
            <div className="bg-white border">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-medium">Recent Orders</h2>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
                  View All →
                </Link>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 text-sm">
                  <tr>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="p-3 font-mono text-sm">{order.id}</td>
                      <td className="p-3">{order.customer}</td>
                      <td className="p-3">{order.items}</td>
                      <td className="p-3">¥{order.total.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          order.status === "Delivered" ? "bg-green-100 text-green-700" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-500">{order.date}</td>
                      <td className="p-3">
                        <button className="text-sm text-blue-600 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Artworks Management */}
          {activeTab === "artworks" && (
            <div className="bg-white border">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-medium">Artworks Management</h2>
                <div className="flex gap-2">
                  <Link href="/admin/artworks/new" className="px-4 py-2 bg-black text-white text-sm">
                    + Add Artwork
                  </Link>
                </div>
              </div>
              <div className="p-8 text-center text-gray-500">
                <p>Artwork management panel</p>
                <p className="text-sm mt-2">Go to Sanity Studio for full artwork management</p>
                <a 
                  href="https://zlh03v8i.sanity.studio/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Open Sanity Studio →
                </a>
              </div>
            </div>
          )}

          {/* Artists Management */}
          {activeTab === "artists" && (
            <div className="bg-white border">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-medium">Artists Management</h2>
                <Link href="/admin/artists/new" className="px-4 py-2 bg-black text-white text-sm">
                  + Add Artist
                </Link>
              </div>
              <div className="p-8 text-center text-gray-500">
                <p>Artist management panel</p>
                <p className="text-sm mt-2">Go to Sanity Studio for full artist management</p>
                <a 
                  href="https://zlh03v8i.sanity.studio/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Open Sanity Studio →
                </a>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="bg-white border p-6">
              <h2 className="font-medium mb-6">Store Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name</label>
                  <input type="text" defaultValue="YiiArt" className="w-full px-3 py-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input type="email" defaultValue="contact@yiiart.com" className="w-full px-3 py-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select className="w-full px-3 py-2 border">
                    <option>CNY (¥)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Free Shipping Threshold</label>
                  <input type="number" defaultValue="0" className="w-full px-3 py-2 border" />
                </div>
                <button className="px-6 py-2 bg-black text-white">Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
