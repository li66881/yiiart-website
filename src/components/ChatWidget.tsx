"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/context/LanguageContext"

interface Message {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
}

export default function ChatWidget() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! Welcome to YiiArt. How can I help you today? 🎨",
      sender: "support",
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isMinimized, setIsMinimized] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")

    // Simulate support response
    setTimeout(() => {
      const responses = [
        "Thank you for your message! Our team will get back to you shortly.",
        "Great question! Let me check that for you.",
        "For artwork inquiries, our artists typically respond within 24 hours.",
        "We offer free shipping worldwide and 30-day returns!",
        "You can track your order in the My Orders section after logging in."
      ]
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "support",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMessage])
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition z-50"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border">
      {/* Header */}
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium">YiiArt Support</h3>
          <p className="text-xs text-gray-300">We typically reply within 1 hour</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {isMinimized ? "▲" : "▼"}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.sender === "user" 
                      ? "bg-black text-white rounded-br-none" 
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === "user" ? "text-gray-400" : "text-gray-400"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-gray-100 flex gap-2 overflow-x-auto">
            <button 
              onClick={() => setNewMessage("What's the shipping time?")}
              className="text-xs px-3 py-1 bg-white border hover:bg-gray-50 whitespace-nowrap rounded-full"
            >
              Shipping time?
            </button>
            <button 
              onClick={() => setNewMessage("How do I track my order?")}
              className="text-xs px-3 py-1 bg-white border hover:bg-gray-50 whitespace-nowrap rounded-full"
            >
              Track order?
            </button>
            <button 
              onClick={() => setNewMessage("What's your return policy?")}
              className="text-xs px-3 py-1 bg-white border hover:bg-gray-50 whitespace-nowrap rounded-full"
            >
              Returns?
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border focus:outline-none focus:ring-1 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}
