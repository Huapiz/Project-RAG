"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Send, Menu, X, Trash2, LogOut, Loader2, User, Bot } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Conversation, Message } from "@/lib/types"

interface ChatInterfaceProps {
  userId: string
  userEmail: string
  initialConversations: Conversation[]
}

export default function ChatInterface({ userId, userEmail, initialConversations }: ChatInterfaceProps) {
  // Gunakan initialConversations sebagai state awal
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load pesan saat chat aktif berubah
  useEffect(() => {
    if (activeConversation && activeConversation.id) {
      loadMessages(activeConversation.id)
    } else {
      setMessages([])
    }
  }, [activeConversation])

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    setMessages(data || [])
    setIsLoadingMessages(false)
  }

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .upsert(
        {
          user_id: userId,
          title: "New Chat",
        },
        { onConflict: "id" }
      )
      .select()
      .single()

    if (!error && data) {
      // PERBAIKAN: Gunakan prev state agar list tidak hilang
      setConversations((prev) => [data, ...prev])
      setActiveConversation(data)
      setMessages([])
      setIsSidebarOpen(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    await supabase.from("conversations").delete().eq("id", conversationId)

    // PERBAIKAN: Gunakan prev state
    setConversations((prev) => prev.filter((c) => c.id !== conversationId))
    
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null)
      setMessages([])
    }
  }

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage

    await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId)

    // PERBAIKAN: Gunakan prev state untuk update judul di sidebar secara realtime
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c))
    )
    
    // Update juga di activeConversation jika sedang aktif
    if (activeConversation?.id === conversationId) {
        setActiveConversation((prev) => prev ? { ...prev, title } : null)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    let currentConversation = activeConversation

    // 1. Jika belum ada chat aktif, buat baru DULU
    if (!currentConversation) {
      const { data, error } = await supabase
        .from("conversations")
        .upsert(
          {
            user_id: userId,
            title: "New Chat",
          },
          { onConflict: "id" }
        )
        .select()
        .single()

      if (error || !data) return
      
      currentConversation = data
      
      // PERBAIKAN: Update state lokal & Sidebar TANPA reload
      setConversations((prev) => [data, ...prev])
      setActiveConversation(data)
      
      // router.refresh() <-- INI DIHAPUS, karena sudah di-handle state di atas
    }

    if (!currentConversation || !currentConversation.id) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    const conversationId = currentConversation.id

    // Optimistic UI: Tampilkan pesan user segera
    const tempUserMessage: Message = {
      id: "temp-" + Date.now(),
      conversation_id: conversationId,
      user_id: userId,
      role: "webapp",
      content: userMessage,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMessage])

    // Jika ini pesan pertama, update judul chat di sidebar
    if (messages.length === 0) {
      updateConversationTitle(conversationId, userMessage)
    }

    try {
      // Call n8n webhook
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          userId,
        }),
      })

      const rawText = await response.text()

      if (!rawText || rawText.trim() === "") {
        throw new Error("Webhook returned empty response")
      }

      let data: any
      try {
        data = JSON.parse(rawText)
      } catch (err) {
        console.error("Invalid JSON from webhook:", rawText)
        throw new Error("Invalid JSON response from AI webhook")
      }

      const assistantResponse =
        typeof data.response === "string" && data.response.trim() !== ""
          ? data.response
          : "Sorry, I could not process your request."

      // Simpan jawaban AI ke database
      const { data: savedAssistantMessage } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: "assistant",
          content: assistantResponse,
        })
        .select()
        .single()

      if (savedAssistantMessage) {
        setMessages((prev) => [...prev, savedAssistantMessage])
      }

      // Update timestamp percakapan agar naik ke atas (opsional, perlu logic sorting di state jika mau)
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)
      
    } catch (err) {
      // Simpan pesan error
      const { data: errorMessage } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        })
        .select()
        .single()

      if (errorMessage) {
        setMessages((prev) => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-80 md:w-80 lg:w-80 bg-card border-r border-border transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">AI Chat</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Button
              onClick={createNewConversation}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {conversations.map((conversation) => {
                if (!conversation.id) return null
                
                const isActive = activeConversation?.id === conversation.id

                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversation(conversation)
                      setIsSidebarOpen(false)
                    }}
                    className={`
                      group
                      relative
                      w-full
                      px-3 py-2
                      rounded-lg
                      cursor-pointer
                      transition-colors
                      ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted text-foreground"
                      }
                    `}
                  >
                    {/* ICON + TITLE */}
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-4 w-4 shrink-0" />

                      <span className="text-sm truncate pr-10">
                        {conversation.title}
                      </span>
                    </div>

                    {/* TRASH ICON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (conversation.id) deleteConversation(conversation.id)
                      }}
                      className={`
                        absolute
                        right-2
                        top-1/2
                        -translate-y-1/2
                        text-muted-foreground
                        hover:text-destructive
                        transition-opacity
                        ${isActive ? "md:opacity-100" : "opacity-0"}
                        lg:opacity-0
                        lg:group-hover:opacity-100
                      `}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground truncate flex-1">{userEmail}</span>
            </div>
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 p-4 border-b border-border shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-foreground">{activeConversation?.title || "AI Chat"}</span>
        </header>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {!activeConversation && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to AI Chat</h2>
              <p className="text-muted-foreground max-w-md">
                Start a new conversation by typing a message below. Your chat history will be saved automatically.
              </p>
            </div>
          ) : isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex gap-3 ${message.role === "webapp" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${message.role === "webapp" ? "flex flex-col items-end" : ""}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === "webapp" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                  {message.role === "webapp" && (
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border shrink-0">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-2">Powered by n8n webhook integration</p>
        </div>
      </main>
    </div>
  )
}