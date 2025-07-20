import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging for production
console.log('🚀 Supabase Configuration:')
console.log('URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌')
console.log('Key:', supabaseAnonKey ? 'Set ✅' : 'Missing ❌')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment')
}

// Create Supabase client with fallback values for build time
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

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

  // Auto-update session name based on chat history
  static async autoUpdateSessionName(sessionId: string, userId: string): Promise<boolean> {
    try {
      console.log('🤖 Auto-updating session name from chat history...')
      
      // Get current session to check if it has a generic name
      const session = await this.getSession(sessionId, userId)
      if (!session) return false
      
      // Only auto-update if the current name is generic or default
      const genericNames = ['New Chat', 'New Workflow', 'Welcome to agen8 vibe coding platform']
      const shouldUpdate = genericNames.some(name => 
        session.session_name.toLowerCase().includes(name.toLowerCase())
      ) || session.session_name.startsWith('Updated ')
      
      if (!shouldUpdate) {
        console.log(`📝 Session already has a meaningful name: "${session.session_name}"`)
        return true
      }
      
      const newName = await this.generateSessionNameFromChat(sessionId, userId)
      
      if (newName && newName !== session.session_name) {
        console.log(`🏷️ Auto-updating title from "${session.session_name}" to "${newName}"`)
        return await this.updateSessionName(sessionId, userId, newName)
      }
      
      return true
    } catch (error) {
      console.error('Error auto-updating session name:', error)
      return false
    }
  }

  // Generate session name from chat history
  static async generateSessionNameFromChat(sessionId: string, userId: string): Promise<string> {
    try {
      const chatHistory = await this.getChatHistory(sessionId, userId)
      
      if (chatHistory.length === 0) {
        return "New Workflow"
      }
      
      // Combine all user messages to get the full context
      const userMessages = chatHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ')
      
      // Get assistant messages to understand what was built
      const assistantMessages = chatHistory
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content)
        .join(' ')
      
      // Extract workflow names from assistant messages
      const workflowNameMatch = assistantMessages.match(/Updated workflow:\s*([^\.!\n]+)/i)
      if (workflowNameMatch) {
        const workflowName = workflowNameMatch[1].trim()
        if (workflowName && !workflowName.toLowerCase().includes('welcome')) {
          console.log(`✅ Extracted workflow name from chat: "${workflowName}"`)
          return workflowName
        }
      }
      
      // Look for workflow descriptions in assistant messages
      const workflowDescMatch = assistantMessages.match(/Generated Workflow:\s*([^\n]+)/i)
      if (workflowDescMatch) {
        const desc = workflowDescMatch[1].trim()
        if (desc && !desc.toLowerCase().includes('welcome')) {
          console.log(`✅ Extracted workflow description: "${desc}"`)
          return desc
        }
      }
      
      // Extract action-object patterns from user messages
      const actionObjectPattern = userMessages.match(/\b(build|create|make|setup)\s+(a\s+)?([^,\.]+?(?:workflow|automation|process|system|integration))/i)
      if (actionObjectPattern) {
        let title = actionObjectPattern[3].trim()
        title = title.replace(/^(a|an|the)\s+/i, '') // Remove articles
        title = title.charAt(0).toUpperCase() + title.slice(1)
        console.log(`✅ Extracted from action-object pattern: "${title}"`)
        return title
      }
      
      // Look for "containing" patterns that describe workflow components
      const containingMatch = userMessages.match(/\b(?:containing|with|including)\s+([^\.!]+)/i)
      if (containingMatch) {
        const components = containingMatch[1]
          .split(/\s*(?:,|and|then|\+)\s*/)
          .slice(0, 3) // Take first 3 components
          .map(comp => comp.trim())
          .filter(comp => comp.length > 0)
          .join(' + ')
        
        if (components) {
          console.log(`✅ Extracted from components: "${components} Flow"`)
          return `${components} Flow`
        }
      }
      
      // Analyze the conversation to create a meaningful title
      return this.generateSessionName(userMessages)
      
    } catch (error) {
      console.error('Error generating session name from chat:', error)
      return "New Workflow"
    }
  }

  // Generate session name from first user prompt
  static generateSessionName(firstPrompt: string): string {
    if (!firstPrompt) return "New Workflow"
    
    console.log(`🏷️ Generating session name from: "${firstPrompt}"`)
    
    const lowerPrompt = firstPrompt.toLowerCase()
    
    // Special patterns for specific workflow types
    if (lowerPrompt.includes('cold email') || (lowerPrompt.includes('email') && lowerPrompt.includes('cold'))) {
      if (lowerPrompt.includes('slack') && lowerPrompt.includes('google') && lowerPrompt.includes('telegram')) {
        return "Cold Email → Slack → Sheets → Telegram"
      } else if (lowerPrompt.includes('slack') && lowerPrompt.includes('google')) {
        return "Cold Email → Slack → Google Sheets"
      } else if (lowerPrompt.includes('slack')) {
        return "Cold Email → Slack Notification"
      } else {
        return "Cold Email Automation"
      }
    }
    
    // Lead generation workflows
    if (lowerPrompt.includes('lead') && (lowerPrompt.includes('generation') || lowerPrompt.includes('capture'))) {
      return "Lead Generation Pipeline"
    }
    
    // CRM workflows
    if (lowerPrompt.includes('crm') || lowerPrompt.includes('salesforce') || lowerPrompt.includes('hubspot')) {
      return "CRM Integration Workflow"
    }
    
    // Social media workflows
    if (lowerPrompt.includes('social') || lowerPrompt.includes('linkedin') || lowerPrompt.includes('twitter') || lowerPrompt.includes('instagram')) {
      return "Social Media Automation"
    }
    
    // E-commerce workflows
    if (lowerPrompt.includes('order') || lowerPrompt.includes('payment') || lowerPrompt.includes('stripe') || lowerPrompt.includes('paypal')) {
      return "E-commerce Automation"
    }
    
    // Extract workflow-related keywords for better titles
    const workflowKeywords = lowerPrompt.match(/\b(email|slack|webhook|api|database|csv|excel|salesforce|google|zapier|automation|workflow|trigger|send|create|update|delete|fetch|sync|schedule|discord|notion|airtable|calendar|form|survey|payment|stripe|paypal|instagram|twitter|facebook|linkedin|youtube|tiktok|whatsapp|telegram|sms|push|notification)\b/g)
    
    if (workflowKeywords && workflowKeywords.length > 0) {
      // Use workflow keywords to create meaningful titles
      const uniqueKeywords = Array.from(new Set(workflowKeywords)).slice(0, 3)
      
      // Create more natural titles based on keyword combinations
      if (uniqueKeywords.includes('email') && uniqueKeywords.includes('slack')) {
        return "Email → Slack Integration"
      } else if (uniqueKeywords.includes('google') && uniqueKeywords.includes('slack')) {
        return "Google Sheets → Slack Sync"
      } else if (uniqueKeywords.includes('webhook') && uniqueKeywords.includes('slack')) {
        return "Webhook → Slack Notification"
      } else if (uniqueKeywords.includes('trigger') && uniqueKeywords.length > 1) {
        const otherKeyword = uniqueKeywords.find(k => k !== 'trigger')
        if (otherKeyword) {
          return `${otherKeyword.charAt(0).toUpperCase() + otherKeyword.slice(1)} Trigger Workflow`
        }
      } else {
        const title = uniqueKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' + ') + ' Flow'
        console.log(`✅ Generated keyword-based title: "${title}"`)
        return title
      }
    }
    
    // Look for action words to create better titles
    const actionMatch = firstPrompt.toLowerCase().match(/\b(create|build|make|generate|setup|automate|send|get|fetch|sync|upload|download|process|convert|transform|monitor|track|alert|notify)\b/)
    const objectMatch = firstPrompt.toLowerCase().match(/\b(workflow|task|email|file|data|report|invoice|lead|contact|order|customer|product|user|message|post|content)\b/)
    
    if (actionMatch && objectMatch) {
      const title = `${actionMatch[0].charAt(0).toUpperCase() + actionMatch[0].slice(1)} ${objectMatch[0].charAt(0).toUpperCase() + objectMatch[0].slice(1)}`
      console.log(`✅ Generated action-object title: "${title}"`)
      return title
    }
    
    // Fallback: use first few meaningful words of the prompt
    let name = firstPrompt
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\b(create|build|make|a|an|the|for|to|with|using|by|from|and|or|but|in|on|at|is|are|was|were)\b/gi, '') // Remove common words
      .trim()
      .split(' ')
      .filter(word => word.length > 2) // Keep words longer than 2 chars
      .slice(0, 3) // Take first 3 meaningful words
      .join(' ')
    
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, l => l.toUpperCase())
    
    if (!name) {
      name = firstPrompt.split(' ').slice(0, 3).join(' ')
      name = name.charAt(0).toUpperCase() + name.slice(1)
    }
    
    console.log(`✅ Generated fallback title: "${name}"`)
    return name || "New Workflow"
  }
}