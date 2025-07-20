'use client'

import { useState, useEffect, useRef } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { WorkflowMemory, ChatMessage } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  Sparkles
} from 'lucide-react'

export function ChatInterface() {
  const { 
    sessionId, 
    userId, 
    isMemoryEnabled,
    prompt,
    setPrompt,
    generateWorkflow,
    isLoading,
    lastMessageTimestamp
  } = useWorkflowStore()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    
    // Store the prompt before clearing
    const currentPrompt = prompt.trim()
    
    // Clear the input immediately for better UX
    setPrompt('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = '60px'
    }
    
    // Generate workflow with the stored prompt
    try {
      await generateWorkflow()
    } catch (error) {
      // If error, restore the prompt
      setPrompt(currentPrompt)
      console.error('Failed to generate workflow:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 space-y-4 hide-scrollbar"
        style={{
          overflowY: 'auto',
          minHeight: 0,
          height: '100%'
        }}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Build!
            </h3>
            <p className="text-gray-600 text-sm mb-4 px-4">
              Describe your automation workflow below.
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="font-medium text-blue-900">First Prompt</span>
                </div>
                <p className="text-blue-700">Creates fresh workflow</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                  <span className="font-medium text-green-900">Next Prompts</span>
                </div>
                <p className="text-green-700">Build incrementally</p>
              </div>
            </div>
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
                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.role === 'assistant' ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Workflow Updated</span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.workflow_snapshot && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Generated Workflow:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {message.workflow_snapshot.name || 'Untitled Workflow'} 
                            <span className="text-gray-500 ml-2">
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
                
                {/* Timestamp */}
                <div className={`mt-1 text-xs text-gray-500 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.created_at && formatTime(message.created_at)}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Generating...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                // Auto-resize textarea
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto'
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe your workflow..."
              className="resize-none border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500 text-sm scrollbar-hide"
              rows={2}
              disabled={isLoading}
              style={{
                minHeight: '60px',
                maxHeight: '120px',
                overflow: 'hidden'
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="h-15 w-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {!isMemoryEnabled && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Enable memory to save chats
          </p>
        )}
      </div>
    </div>
  )
}