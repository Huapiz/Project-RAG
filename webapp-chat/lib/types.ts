export interface Conversation {
  id?: string
  user_id: string
  title: string
  created_at?: string
  updated_at?: string
}

export interface Message {
  id?: string
  conversation_id: string
  user_id: string
  role: "webapp" | "telegram" | "assistant"
  content: string
  created_at?: string
}
