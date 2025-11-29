"use client"

import type React from "react"

import { useState, useEffect } from "react"

export default function Home() {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState("checking")
  const [lastRequest, setLastRequest] = useState("Belum ada")

  useEffect(() => {
    checkServerHealth()
    const interval = setInterval(checkServerHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkServerHealth = async () => {
    try {
      const res = await fetch("/api/health")
      if (res.ok) {
        setServerStatus("ok")
      }
    } catch {
      setServerStatus("error")
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      setError("⚠️ Masukkan pertanyaan terlebih dahulu")
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan")
      }

      setResponse(JSON.stringify(data.data, null, 2))
      setLastRequest(new Date().toLocaleTimeString("id-ID"))
      setQuestion("")
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response)
      alert("✅ Response berhasil di-copy!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center text-white mb-8 animate-in slide-in-from-top">
          <h1 className="text-4xl font-bold mb-2">🤖 n8n Webhook WebApp</h1>
          <p className="text-lg opacity-90">Kirim pertanyaan ke n8n workflow</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 animate-in slide-in-from-bottom flex-1 flex flex-col">
          {/* Form */}
          <form onSubmit={handleSend} className="mb-6">
            <label className="block font-semibold text-gray-800 mb-3">Pertanyaan Anda</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Masukkan pertanyaan Anda di sini..."
              rows={4}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50 resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Mengirim...
                </>
              ) : (
                <>📤 Kirim ke n8n</>
              )}
            </button>
          </form>

          {/* Status Message */}
          {error && (
            <div className="p-4 mb-6 bg-red-100 border-2 border-red-300 rounded-lg text-red-800 animate-in slide-in-from-top">
              {error}
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mb-6 animate-in slide-in-from-top">
              <h2 className="text-xl font-bold text-gray-800 mb-3">📋 Response dari n8n</h2>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto mb-3">
                <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap break-words">{response}</pre>
              </div>
              <button
                onClick={handleCopy}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                📋 Copy Response
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-gray-100 rounded-lg p-4 mt-auto">
            <h3 className="font-bold text-gray-800 mb-3">ℹ️ Informasi</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>
                <strong>Status Server:</strong>{" "}
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-white font-semibold ${
                    serverStatus === "ok"
                      ? "bg-green-500"
                      : serverStatus === "checking"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500"
                  }`}
                >
                  {serverStatus === "ok" ? "✅ Online" : serverStatus === "checking" ? "⏳ Checking..." : "❌ Offline"}
                </span>
              </li>
              <li>
                <strong>Last Request:</strong> {lastRequest}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white opacity-80 mt-8 text-sm">
          <p>n8n Webhook WebApp | Built with Next.js + TypeScript</p>
        </div>
      </div>
    </div>
  )
}
