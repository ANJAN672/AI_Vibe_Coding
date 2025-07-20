'use client'

import { useState, useEffect } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { WorkflowMemory, ChatWorkflow } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X
} from 'lucide-react'

export function SessionSidebar() {
  const { 
    sessionId, 
    userId, 
    isMemoryEnabled,
    startNewSession,
    loadSession
  } = useWorkflowStore()

  const [sessions, setSessions] = useState<ChatWorkflow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Load all sessions for the user
  useEffect(() => {
    const loadSessions = async () => {
      if (!userId || !isMemoryEnabled) {
        setSessions([])
        return
      }

      setIsLoading(true)
      try {
        const allSessions = await WorkflowMemory.getAllSessions(userId)
        setSessions(allSessions)
      } catch (error) {
        console.error('Failed to load sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [userId, isMemoryEnabled, sessionId])

  const handleNewSession = async () => {
    setIsLoading(true)
    try {
      await startNewSession()
      if (userId) {
        const allSessions = await WorkflowMemory.getAllSessions(userId)
        setSessions(allSessions)
      }
    } catch (error) {
      console.error('Failed to create new session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadSession = async (targetSessionId: string) => {
    if (targetSessionId === sessionId) return
    
    try {
      await loadSession(targetSessionId)
      if (userId) {
        const allSessions = await WorkflowMemory.getAllSessions(userId)
        setSessions(allSessions)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const handleDeleteSession = async (targetSessionId: string) => {
    if (!userId) return
    
    try {
      await WorkflowMemory.deleteSession(targetSessionId, userId)
      
      if (targetSessionId === sessionId) {
        await startNewSession()
      }
      
      const allSessions = await WorkflowMemory.getAllSessions(userId)
      setSessions(allSessions)
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const handleStartEdit = (session: ChatWorkflow) => {
    setEditingSessionId(session.session_id)
    setEditingName(session.session_name)
  }

  const handleSaveEdit = async () => {
    if (!editingSessionId || !userId) return
    
    try {
      await WorkflowMemory.updateSessionName(editingSessionId, userId, editingName.trim() || 'New Chat')
      const allSessions = await WorkflowMemory.getAllSessions(userId)
      setSessions(allSessions)
    } catch (error) {
      console.error('Failed to update session name:', error)
    }
    
    setEditingSessionId(null)
    setEditingName('')
  }

  const handleCancelEdit = () => {
    setEditingSessionId(null)
    setEditingName('')
  }

  const generateAutoTitle = (content: string) => {
    // Extract key workflow-related words
    const keywords = content.toLowerCase().match(/\b(email|slack|webhook|api|database|csv|excel|salesforce|google|zapier|automation|workflow|trigger|send|create|update|delete|fetch|sync|schedule)\b/g)
    
    if (keywords && keywords.length > 0) {
      // Capitalize first letter and take first 2-3 keywords
      const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 2)
      return uniqueKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' & ') + ' Workflow'
    }
    
    // Fallback: use first few words of the content
    const words = content.trim().split(' ').slice(0, 4)
    if (words.length > 0) {
      return words.join(' ').substring(0, 30) + (content.length > 30 ? '...' : '')
    }
    
    return 'New Workflow'
  }

  if (!isMemoryEnabled) {
    return (
      <div className="p-4 text-center">
        <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">Memory disabled</p>
        <Button
          onClick={() => useWorkflowStore.getState().toggleMemory()}
          size="sm"
          variant="outline"
        >
          Enable Memory
        </Button>
      </div>
    )
  }

  return (
    <div className="h-48 flex flex-col border-b border-gray-200">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <Button
          onClick={handleNewSession}
          disabled={isLoading}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-6 w-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  session.session_id === sessionId 
                    ? 'bg-blue-100 border border-blue-200' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleLoadSession(session.session_id)}
              >
                <MessageCircle className={`h-4 w-4 flex-shrink-0 ${
                  session.session_id === sessionId ? 'text-blue-600' : 'text-gray-400'
                }`} />
                
                <div className="flex-1 min-w-0">
                  {editingSessionId === session.session_id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        className="p-1 h-6 w-6"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="p-1 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className={`text-sm font-medium truncate ${
                      session.session_id === sessionId ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {session.session_name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {editingSessionId !== session.session_id && (
                  <div 
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(session)}
                      className="p-1 h-6 w-6"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSession(session.session_id)}
                      className="p-1 h-6 w-6 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}