import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug logging for production
console.log('🚀 Supabase Configuration:')
console.log('URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌')
console.log('Key:', supabaseAnonKey ? 'Set ✅' : 'Missing ❌')
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface ChatWorkflow {
  id?: string
  user_id: string
  session_id: string
  session_name: string // Human-readable session name
  current_workflow: any // n8n workflow JSON
  created_at?: string
  updated_at?: string
}

export interface ChatMessage {
  id?: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  workflow_snapshot?: any // n8n workflow JSON at this point
  created_at?: string
}

// Workflow operations
export class WorkflowMemory {
  static async getSession(sessionId: string, userId: string): Promise<ChatWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('chat_workflows')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching session:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getSession:', error)
      return null
    }
  }

  static async saveWorkflow(sessionId: string, userId: string, workflow: any): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('chat_workflows')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          current_workflow: workflow,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id,user_id'
        })

      if (error) {
        console.error('Error saving workflow:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in saveWorkflow:', error)
      return false
    }
  }

  static async createNewSession(sessionId: string, userId: string, initialWorkflow: any, sessionName: string = "New Chat"): Promise<boolean> {
    try {
      console.log('🔄 Creating new session:', { sessionId, userId, sessionName })
      
      const { data, error } = await supabase
        .from('chat_workflows')
        .insert({
          session_id: sessionId,
          user_id: userId,
          session_name: sessionName,
          current_workflow: initialWorkflow,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Supabase Error creating session:', error)
        console.error('Error details:', { details: error.details, hint: error.hint, message: error.message })
        return false
      }
      
      console.log('✅ Session created successfully')

      return true
    } catch (error) {
      console.error('Error in createNewSession:', error)
      return false
    }
  }

  static async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_workflows')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting session:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteSession:', error)
      return false
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static generateUserId(): string {
    // In a real app, this would come from user authentication
    // For now, we'll use localStorage or generate a persistent ID
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('workflow_user_id')
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('workflow_user_id', userId)
      }
      return userId
    }
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Chat message operations
  static async getChatHistory(sessionId: string, userId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching chat history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getChatHistory:', error)
      return []
    }
  }

  static async saveMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          ...message,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving message:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in saveMessage:', error)
      return false
    }
  }

  static async clearChatHistory(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error clearing chat history:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in clearChatHistory:', error)
      return false
    }
  }

  // Get all sessions for a user (for ChatGPT-style sidebar)
  static async getAllSessions(userId: string): Promise<ChatWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('chat_workflows')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching sessions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllSessions:', error)
      return []
    }
  }

  // Update session name
  static async updateSessionName(sessionId: string, userId: string, newName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_workflows')
        .update({ 
          session_name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating session name:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateSessionName:', error)
      return false
    }
  }

  // Generate session name from first user prompt
  static generateSessionName(firstPrompt: string): string {
    if (!firstPrompt) return "New Workflow"
    
    // Extract workflow-related keywords for better titles
    const workflowKeywords = firstPrompt.toLowerCase().match(/\b(email|slack|webhook|api|database|csv|excel|salesforce|google|zapier|automation|workflow|trigger|send|create|update|delete|fetch|sync|schedule|discord|notion|airtable|calendar|form|survey|payment|stripe|paypal)\b/g)
    
    if (workflowKeywords && workflowKeywords.length > 0) {
      // Use workflow keywords to create meaningful titles
      const uniqueKeywords = Array.from(new Set(workflowKeywords)).slice(0, 2)
      return uniqueKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' & ') + ' Workflow'
    }
    
    // Fallback: use first few words of the prompt
    let name = firstPrompt
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim()
      .split(' ')
      .slice(0, 4) // Take first 4 words
      .join(' ')
    
    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1)
    
    // Add "Workflow" if not present
    if (!name.toLowerCase().includes('workflow')) {
      name += ' Workflow'
    }
    
    return name || "New Workflow"
  }
}