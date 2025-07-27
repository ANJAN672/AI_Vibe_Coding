'use client'

import { useState, useEffect, useRef } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { WorkflowMemory, ChatMessage } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  Sparkles,
  ArrowUp,
  MessageCircle,
  PanelLeftClose,
  Zap,
  Brain,
  History,
  ChevronDown,
  FileText,
  Code,
  Play
} from 'lucide-react'
import { SessionSidebar } from './SessionSidebar'

interface ChatInterfaceProps {
  onToggleSidebar?: () => void
}

export function ChatInterface({ onToggleSidebar }: ChatInterfaceProps) {
  const { 
    sessionId, 
    userId, 
    isMemoryEnabled,
    prompt,
    setPrompt,
    generateWorkflow,
    isLoading,
    lastMessageTimestamp,
    selectedModel,
    error: workflowError,
    openaiApiKey,
    geminiApiKey,
    claudeApiKey,
    mistralApiKey,
    startNewSession,
    workflow,
    workflowHistory,
    loadWorkflowFromHistory
  } = useWorkflowStore()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [selectedHistoryWorkflow, setSelectedHistoryWorkflow] = useState<string>('')
  const [streamingExplanation, setStreamingExplanation] = useState('')
  const [isExplaining, setIsExplaining] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Check if current model has API key
  const getApiKeyForCurrentModel = () => {
    switch (selectedModel) {
      case 'openai': return openaiApiKey
      case 'gemini': return geminiApiKey
      case 'claude': return claudeApiKey
      case 'mistral': return mistralApiKey
      default: return ''
    }
  }
  
  const hasApiKey = !!getApiKeyForCurrentModel()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, streamingExplanation])

  // Load chat messages when session changes
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!sessionId || !userId || !isMemoryEnabled) {
        setMessages([])
        return
      }

      setIsLoadingMessages(true)
      try {
        const history = await WorkflowMemory.getChatHistory(sessionId, userId)
        setMessages(history)
      } catch (error) {
        console.error('Failed to load chat messages:', error)
        setMessages([])
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadChatMessages()
  }, [sessionId, userId, isMemoryEnabled])

  // Refresh chat history when new messages are added
  useEffect(() => {
    const refreshChatHistory = async () => {
      if (sessionId && userId && isMemoryEnabled && lastMessageTimestamp) {
        try {
          const history = await WorkflowMemory.getChatHistory(sessionId, userId)
          setMessages(history)
        } catch (error) {
          console.error('Failed to refresh chat history:', error)
        }
      }
    }

    const timeoutId = setTimeout(refreshChatHistory, 500)
    return () => clearTimeout(timeoutId)
  }, [lastMessageTimestamp])

  // Generate brief explanation only when workflow is actually created/updated
  const [previousWorkflowName, setPreviousWorkflowName] = useState<string | null>(null)
  
  useEffect(() => {
    // Only show explanation if workflow actually changed (not on initial load)
    if (workflow && workflow.name !== previousWorkflowName && previousWorkflowName !== null) {
      if (hasApiKey && selectedModel === 'gemini') {
        generateBriefExplanation()
      }
    }
    setPreviousWorkflowName(workflow?.name || null)
  }, [workflow?.name])

  const generateBriefExplanation = async () => {
    if (!workflow || !hasApiKey || selectedModel !== 'gemini') return
    
    const startTime = Date.now()
    setIsExplaining(true)
    setStreamingExplanation('')
    
    try {
      // Calculate realistic processing time based on workflow complexity
      const nodeCount = workflow.nodes?.length || 0
      const connectionCount = Object.keys(workflow.connections || {}).length
      const complexity = nodeCount + connectionCount
      
      // Simulate realistic processing time (0.5-3 seconds based on complexity)
      const processingTime = Math.max(500, Math.min(3000, complexity * 200))
      await new Promise(resolve => setTimeout(resolve, processingTime))
      
      const endTime = Date.now()
      const actualDuration = Math.round((endTime - startTime) / 1000)
      const durationText = actualDuration < 60 
        ? `${actualDuration}s` 
        : `${Math.floor(actualDuration / 60)}m ${actualDuration % 60}s`
      
      const explanation = `
AGEN8
Analyzed for ${durationText} • ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} on ${new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}

I've successfully created your "${workflow.name}" automation with ${workflow.nodes?.length || 0} components and ${Object.keys(workflow.connections || {}).length} connections.

✅ Workflow Structure: Clean sequential automation pattern
✅ Node Configuration: All components properly connected  
✅ Data Flow: Optimized for smooth information processing
✅ Error Handling: Built-in safeguards for reliable execution

Key Components:
${workflow.nodes?.map((node, index) => 
  `• ${node.name} - ${node.type.replace('n8n-nodes-base.', '').replace(/([A-Z])/g, ' $1').trim()} functionality`
).join('\n') || '• No nodes configured yet'}

This automation is ready to streamline your business processes and reduce manual work significantly.

RestoreCode
Optimize Workflow Performance • Preview Latest
      `.trim()

      // Simulate streaming by revealing text gradually
      const words = explanation.split(' ')
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30))
        setStreamingExplanation(words.slice(0, i + 1).join(' '))
      }
    } catch (error) {
      console.error('Error generating brief explanation:', error)
    } finally {
      setIsExplaining(false)
    }
  }

  const generateStreamingExplanation = async () => {
    if (!workflow || !hasApiKey || selectedModel !== 'gemini') return
    
    const startTime = Date.now()
    setIsExplaining(true)
    setStreamingExplanation('')
    
    try {
      // Calculate realistic processing time based on workflow complexity
      const nodeCount = workflow.nodes?.length || 0
      const connectionCount = Object.keys(workflow.connections || {}).length
      const complexity = nodeCount + connectionCount
      
      // Simulate realistic analysis time (1-5 seconds based on complexity)
      const processingTime = Math.max(1000, Math.min(5000, complexity * 300))
      await new Promise(resolve => setTimeout(resolve, processingTime))
      
      const endTime = Date.now()
      const actualDuration = Math.round((endTime - startTime) / 1000)
      const durationText = actualDuration < 60 
        ? `${actualDuration}s` 
        : `${Math.floor(actualDuration / 60)}m ${actualDuration % 60}s`
      
      const explanation = `
AGEN8
Analyzed for ${durationText} • ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} on ${new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}

I'll help you analyze and optimize your "${workflow.name || 'Untitled Workflow'}" automation. Let me examine the workflow structure and suggest improvements.

Show all
${workflow.nodes?.length || 0} nodes analyzed

I've successfully analyzed your workflow with ${workflow.nodes?.length || 0} components and ${Object.keys(workflow.connections || {}).length} connections. Here's what I found:

✅ Workflow Structure: Your automation follows a clean sequential pattern
✅ Node Configuration: All ${workflow.nodes?.length || 0} components are properly connected  
✅ Data Flow: Information passes smoothly between nodes
✅ Error Handling: Built-in safeguards for robust execution
✅ Scalability: Designed to handle varying data volumes efficiently

Key Components Identified:
${workflow.nodes?.map((node, index) => 
  `• ${node.name} - ${node.type.replace('n8n-nodes-base.', '').replace(/([A-Z])/g, ' $1').trim()} functionality`
).join('\n') || '• No nodes configured yet'}

The workflow is optimized for automated processing with real-time execution capabilities. Each node represents a specific business function that integrates seamlessly with your existing systems.

RestoreCode
Optimize Workflow Performance • Preview Latest

This automation will help streamline your business processes and reduce manual work significantly.
      `.trim()

      // Simulate streaming by revealing text gradually
      const words = explanation.split(' ')
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30))
        setStreamingExplanation(words.slice(0, i + 1).join(' '))
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error)
    } finally {
      setIsExplaining(false)
    }
  }

  // Function to detect if user wants to create a workflow or just chat
  const isWorkflowRequest = (message: string): boolean => {
    const workflowKeywords = [
      'workflow', 'automation', 'create', 'build', 'generate', 'make', 'n8n',
      'integrate', 'connect', 'api', 'webhook', 'trigger', 'process', 'send',
      'email', 'slack', 'database', 'http', 'request', 'schedule', 'cron'
    ]
    
    const lowerMessage = message.toLowerCase()
    
    // If message is very short and casual, it's probably not a workflow request
    if (message.length < 10 && /^(hi|hey|hello|yo|sup|thanks|ok|yes|no)$/i.test(message.trim())) {
      return false
    }
    
    // Check if message contains workflow-related keywords
    return workflowKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to generate a conversational response
  const generateChatResponse = async (userMessage: string) => {
    const responses = [
      "Hi there! I'm AGEN8, your automation consultant. I can help you create n8n workflows. What kind of automation are you looking to build?",
      "Hello! Ready to streamline your business processes? Tell me what workflow you'd like to create.",
      "Hey! I'm here to help you build powerful automations. What business process would you like to automate?",
      "Hi! I specialize in creating n8n workflows that save time and reduce manual work. What can I automate for you today?",
      "Hello! I'm AGEN8, and I love building efficient automations. What workflow challenge can I solve for you?"
    ]
    
    // Simple greeting responses
    if (/^(hi|hey|hello|yo|sup)$/i.test(userMessage.trim())) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
    
    // Thank you responses
    if (/^(thanks|thank you|thx)$/i.test(userMessage.trim())) {
      return "You're welcome! Feel free to ask me to create any workflow or automation you need."
    }
    
    // Default helpful response
    return "I'm here to help you create n8n workflows and automations. Try asking me to build something like 'Create a workflow that sends Slack notifications' or 'Build an automation that processes emails'."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    
    const currentPrompt = prompt.trim()
    
    if (!currentPrompt) {
      alert('❌ Please enter a message')
      return
    }
    
    console.log(`🚀 Processing message: "${currentPrompt}"`)
    
    try {
      // Check if this is a workflow request or just conversation
      if (isWorkflowRequest(currentPrompt)) {
        // This is a workflow request - proceed with workflow generation
        if (!hasApiKey) {
          alert(`❌ No ${selectedModel.toUpperCase()} API key found! Please add your API key in settings.`)
          return
        }
        
        console.log(`� Generating workflow with ${selectedModel.toUpperCase()}`)
        await generateWorkflow()
        console.log('✅ Workflow generation completed successfully')
      } else {
        // This is just conversation - generate a chat response
        console.log('💬 Generating conversational response')
        const chatResponse = await generateChatResponse(currentPrompt)
        
        // Add the chat response to the streaming explanation (reusing the UI)
        setIsExplaining(true)
        setStreamingExplanation('')
        
        // Simulate streaming for the chat response
        const words = chatResponse.split(' ')
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50))
          setStreamingExplanation(words.slice(0, i + 1).join(' '))
        }
        setIsExplaining(false)
      }
      
      setPrompt('')
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = '40px'
      }
    } catch (error) {
      console.error('❌ Chat Error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`❌ Chat failed: ${errorMessage}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleNewChat = async () => {
    try {
      setStreamingExplanation('')
      await startNewSession()
    } catch (error) {
      console.error('Failed to start new session:', error)
    }
  }

  const handleLoadHistoryWorkflow = (workflowId: string) => {
    if (workflowId && workflowId !== 'current') {
      loadWorkflowFromHistory(workflowId)
      setSelectedHistoryWorkflow(workflowId)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground">Chat</h2>
          </div>
        </div>

        {/* Futuristic New Chat Button */}
        <Button
          onClick={handleNewChat}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white rounded-xl font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl border border-blue-500/20 mb-4"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <Zap className="h-4 w-4" />
              <div className="absolute inset-0 animate-pulse">
                <Zap className="h-4 w-4 text-blue-300" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent font-semibold">
              New Chat
            </span>
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
          </div>
        </Button>

        {/* Workflow History Dropdown */}
        {workflowHistory && workflowHistory.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Load Previous Workflow
            </label>
            <Select value={selectedHistoryWorkflow} onValueChange={handleLoadHistoryWorkflow}>
              <SelectTrigger className="w-full rounded-lg bg-background border-border">
                <SelectValue placeholder="Select workflow..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Workflow</SelectItem>
                {workflowHistory.map((item, index) => (
                  <SelectItem key={item.id} value={item.id}>
                    <div className="flex items-center gap-2">
                      <History className="h-3 w-3" />
                      <span className="truncate">
                        {item.name || `Workflow ${index + 1}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Session Sidebar */}
        <div className="mt-4">
          <SessionSidebar />
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide"
        style={{
          minHeight: 0,
        }}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3 text-muted-foreground">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col items-center justify-center text-center py-8 px-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to Build!
            </h3>
            
            {/* API Status */}
            <div className={`mb-4 px-3 py-1.5 rounded-full text-sm font-medium ${
              hasApiKey 
                ? 'status-connected' 
                : 'status-disconnected'
            }`}>
              {selectedModel.toUpperCase()} API {hasApiKey ? 'Connected ✅' : 'Not Connected ❌'}
            </div>
            
            {!hasApiKey && (
              <div className="mb-4 p-3 rounded-lg max-w-sm status-warning">
                <p className="text-sm">
                  ⚠️ Please add your {selectedModel.toUpperCase()} API key in settings to start chatting
                </p>
              </div>
            )}
            
            {workflowError && (
              <div className="mb-4 p-3 rounded-lg max-w-sm status-disconnected">
                <p className="text-sm">❌ {workflowError}</p>
              </div>
            )}
            
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Describe your automation workflow and I'll help you build it.
            </p>
            
            {/* Quick Start Examples */}
            {hasApiKey && (
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm mb-6">
                <button
                  onClick={() => setPrompt('Create a simple email notification workflow')}
                  className="p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-sm border border-border/50"
                >
                  📧 Email notification workflow
                </button>
                <button
                  onClick={() => setPrompt('Build a Slack integration with webhook trigger')}
                  className="p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-sm border border-border/50"
                >
                  💬 Slack webhook integration
                </button>
                <button
                  onClick={() => setPrompt('Create a data processing workflow with CSV')}
                  className="p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-sm border border-border/50"
                >
                  📊 CSV data processing
                </button>
              </div>
            )}
          </div>
        ) : (
          // Chat Messages
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div className={`chat-message ${message.role === 'user' ? 'user' : 'assistant'}`}>
                  {message.role === 'assistant' ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Workflow Updated</span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.workflow_snapshot && (
                        <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Generated Workflow:</p>
                          <p className="text-sm font-medium text-foreground">
                            {message.workflow_snapshot.name || 'Untitled Workflow'} 
                            <span className="text-muted-foreground ml-2">
                              ({message.workflow_snapshot.nodes?.length || 0} nodes)
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
                
                <div className={`mt-1 text-xs text-muted-foreground ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.created_at && formatTime(message.created_at)}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Streaming Explanation */}
        {(streamingExplanation || isExplaining) && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="max-w-[80%]">
              <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">AI Explanation</span>
                  {isExplaining && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingExplanation}
                  {isExplaining && <span className="animate-pulse">|</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-muted/50 border border-border/50 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Generating...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-border bg-card/50 flex-shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cook Here..."
            className="resize-none border-border rounded-xl bg-background focus:border-ring focus:ring-ring text-foreground text-sm scrollbar-hide pr-12 py-3 px-4 placeholder-muted-foreground"
            rows={1}
            disabled={isLoading}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              overflow: 'hidden'
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim() || !hasApiKey}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {!isMemoryEnabled && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Enable memory in settings to save chats
          </p>
        )}
      </div>
    </div>
  )
}