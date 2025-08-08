'use client'

import { useState, useEffect } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { WorkflowMemory, ChatWorkflow } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle,
  Edit2, 
  Trash2, 
  Check, 
  X,
  History,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

export function SessionSidebar() {
  const { 
    sessionId, 
    userId, 
    isMemoryEnabled,
    startNewSession,
    loadSession,
    lastMessageTimestamp
  } = useWorkflowStore()

  const [sessions, setSessions] = useState<ChatWorkflow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showHistory, setShowHistory] = useState(true)

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
  }, [userId, isMemoryEnabled, sessionId, lastMessageTimestamp])

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

  if (!isMemoryEnabled) {
    return (
      <div className="p-4 text-center">
        <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">Memory disabled</p>
        <Button
          onClick={() => useWorkflowStore.getState().toggleMemory()}
          size="sm"
          variant="outline"
          className="rounded-lg"
        >
          Enable Memory
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col max-h-64">
      {/* History Section */}
      <div className="mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full justify-start p-2 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
        >
          {showHistory ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
          <History className="h-3 w-3 mr-2" />
          <span className="text-xs font-medium">History ({sessions.length})</span>
        </Button>
      </div>

      {/* Sessions List */}
      {showHistory && (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all duration-200 sidebar-item ${
                    session.session_id === sessionId ? 'active' : ''
                  }`}
                  onClick={() => handleLoadSession(session.session_id)}
                >
                  <MessageCircle className={`h-4 w-4 flex-shrink-0 ${
                    session.session_id === sessionId ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.session_id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 text-sm border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
                          className="p-1 h-6 w-6 rounded-md hover:bg-muted"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="p-1 h-6 w-6 rounded-md hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className={`text-sm font-medium truncate ${
                        session.session_id === sessionId ? 'text-primary' : 'text-foreground'
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
                        className="p-1 h-6 w-6 rounded-md hover:bg-muted"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSession(session.session_id)}
                        className="p-1 h-6 w-6 rounded-md text-destructive hover:bg-destructive/10"
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
      )}
    </div>
  )
}