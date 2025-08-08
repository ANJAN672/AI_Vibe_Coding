/**
 * Global type definitions for AGEN8
 */

// n8n Workflow Types
export interface N8nNode {
  id: string
  name: string
  type: string
  position: [number, number]
  parameters: Record<string, any>
  typeVersion?: number
  credentials?: Record<string, any>
  disabled?: boolean
  notes?: string
  continueOnFail?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
}

export interface N8nWorkflow {
  id?: string
  name: string
  nodes: N8nNode[]
  connections: Record<string, any>
  active?: boolean
  settings?: Record<string, any>
  staticData?: Record<string, any>
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// AI Provider Types
export type LLMProvider = 'openai' | 'gemini' | 'claude' | 'mistral'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

export interface AIResponse {
  message: string
  workflow?: N8nWorkflow
  error?: string
}

// Toast/Notification Types
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Deployment Types
export interface DeploymentCredentials {
  hostUrl: string
  apiKey: string
}

export interface DeploymentResult {
  success: boolean
  message: string
  workflowId?: string
  workflowName?: string
  n8nUrl?: string
  editUrl?: string
  fallbackUrl?: string
  verified?: boolean
  accessible?: boolean
  warning?: string
  error?: string
}

// Memory/Session Types
export interface ChatSession {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  messages: AIMessage[]
  workflow?: N8nWorkflow
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface WorkflowEditorProps extends BaseComponentProps {
  workflow?: N8nWorkflow
  onWorkflowChange?: (workflow: N8nWorkflow) => void
  readOnly?: boolean
}

export interface ChatInterfaceProps extends BaseComponentProps {
  onToggleSidebar?: () => void
  sessionId?: string
}

// Environment Variables
export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  OPENAI_API_KEY?: string
  GEMINI_API_KEY?: string
  CLAUDE_API_KEY?: string
  MISTRAL_API_KEY?: string
  DEFAULT_LLM_PROVIDER?: LLMProvider
  NODE_ENV: 'development' | 'production' | 'test'
  NEXT_PUBLIC_APP_URL?: string
}
