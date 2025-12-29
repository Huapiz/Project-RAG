-- Create conversations table to store chat sessions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table to store chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('webapp', 'telegram', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation using pg_policies check
DO $$
BEGIN
  -- conversations: SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view their own conversations' AND tablename = 'conversations'
  ) THEN
    CREATE POLICY "Users can view their own conversations"
      ON conversations
      FOR SELECT
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- conversations: INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert their own conversations' AND tablename = 'conversations'
  ) THEN
    CREATE POLICY "Users can insert their own conversations"
      ON conversations
      FOR INSERT
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- conversations: UPDATE (restrict both which rows can be updated and what can be set)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can update their own conversations' AND tablename = 'conversations'
  ) THEN
    CREATE POLICY "Users can update their own conversations"
      ON conversations
      FOR UPDATE
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- conversations: DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can delete their own conversations' AND tablename = 'conversations'
  ) THEN
    CREATE POLICY "Users can delete their own conversations"
      ON conversations
      FOR DELETE
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- messages: SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view their own messages' AND tablename = 'messages'
  ) THEN
    CREATE POLICY "Users can view their own messages"
      ON messages
      FOR SELECT
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- messages: INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert their own messages' AND tablename = 'messages'
  ) THEN
    CREATE POLICY "Users can insert their own messages"
      ON messages
      FOR INSERT
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  -- messages: DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can delete their own messages' AND tablename = 'messages'
  ) THEN
    CREATE POLICY "Users can delete their own messages"
      ON messages
      FOR DELETE
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);