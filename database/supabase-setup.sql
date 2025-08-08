-- Chat Workflows Table for n8n Workflow Builder Memory Feature
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE chat_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  session_name TEXT NOT NULL DEFAULT 'New Chat',
  current_workflow JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Create unique constraint on session_id + user_id
  CONSTRAINT unique_user_session UNIQUE (session_id, user_id)
);

-- Chat Messages Table for storing conversation history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  workflow_snapshot JSONB, -- Store workflow state at this point (for assistant messages)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to chat_workflows
  FOREIGN KEY (session_id, user_id) REFERENCES chat_workflows(session_id, user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_chat_workflows_user_id ON chat_workflows(user_id);
CREATE INDEX idx_chat_workflows_session_id ON chat_workflows(session_id);
CREATE INDEX idx_chat_workflows_user_session ON chat_workflows(user_id, session_id);
CREATE INDEX idx_chat_workflows_updated_at ON chat_workflows(updated_at);

-- Indexes for chat_messages
CREATE INDEX idx_chat_messages_session_user ON chat_messages(session_id, user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- RLS (Row Level Security) - optional but recommended
ALTER TABLE chat_workflows ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to only access their own workflows
-- Note: This is a basic policy. Adjust based on your authentication setup.
CREATE POLICY "Users can access their own workflows" ON chat_workflows
  FOR ALL USING (true); -- For demo purposes, allow all access
  -- In production, replace with: FOR ALL USING (auth.uid()::text = user_id);

-- RLS for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own messages" ON chat_messages
  FOR ALL USING (true); -- For demo purposes, allow all access
  -- In production, replace with: FOR ALL USING (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on record changes
CREATE TRIGGER update_chat_workflows_updated_at 
  BEFORE UPDATE ON chat_workflows 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add comments for documentation
COMMENT ON TABLE chat_workflows IS 'Stores chat-style workflow building sessions for incremental workflow development';
COMMENT ON COLUMN chat_workflows.user_id IS 'Identifier for the user (can be from auth or temporary session)';
COMMENT ON COLUMN chat_workflows.session_id IS 'Unique session identifier for each chat conversation';
COMMENT ON COLUMN chat_workflows.current_workflow IS 'Current state of the n8n workflow JSON';
COMMENT ON COLUMN chat_workflows.created_at IS 'When the session was first created';
COMMENT ON COLUMN chat_workflows.updated_at IS 'When the workflow was last updated';