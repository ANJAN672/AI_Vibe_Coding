'use client'

import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  BrainCircuit, 
  RotateCcw, 
  Trash2, 
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react'

export function MemoryToggle() {
  const { 
    isMemoryEnabled, 
    sessionId, 
    chatHistory,
    toggleMemory, 
    startNewSession, 
    clearSession 
  } = useWorkflowStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleNewSession = async () => {
    setIsLoading(true)
    try {
      await startNewSession()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSession = async () => {
    setIsLoading(true)
    try {
      await clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className={`h-5 w-5 ${isMemoryEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
          <h3 className="font-medium text-gray-900">Chat Memory</h3>
        </div>
        <Button
          variant={isMemoryEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleMemory}
          className={isMemoryEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          {isMemoryEnabled ? (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Enabled
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Disabled
            </>
          )}
        </Button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        {isMemoryEnabled 
          ? "🧠 Each prompt builds on your current workflow. Perfect for step-by-step creation!"
          : "🔄 Each prompt starts fresh. Good for creating completely new workflows."
        }
      </p>

      {/* Session Info */}
      {isMemoryEnabled && (
        <div className="space-y-3">
          {sessionId && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Active Session</span>
                </div>
                <span className="text-xs text-purple-600 font-mono bg-purple-100 px-2 py-1 rounded">
                  {sessionId.slice(-8)}
                </span>
              </div>
              
              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-purple-700">
                    <MessageSquare className="h-3 w-3" />
                    <span>{chatHistory.length} message{chatHistory.length === 1 ? '' : 's'} in this session</span>
                  </div>
                  
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {chatHistory.slice(-3).map((msg, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Clock className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-purple-700 truncate">
                          {msg.prompt.length > 50 ? `${msg.prompt.slice(0, 50)}...` : msg.prompt}
                        </span>
                      </div>
                    ))}
                    {chatHistory.length > 3 && (
                      <div className="text-xs text-purple-600 italic">
                        ... and {chatHistory.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              disabled={isLoading}
              className="flex-1 text-xs"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2" />
              ) : (
                <RotateCcw className="h-3 w-3 mr-2" />
              )}
              New Session
            </Button>
            
            {sessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSession}
                disabled={isLoading}
                className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-2" />
                )}
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {isMemoryEnabled && !sessionId && (
        <div className="text-center py-3">
          <p className="text-sm text-gray-500 mb-2">No active session</p>
          <Button
            onClick={handleNewSession}
            disabled={isLoading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Start Memory Session
          </Button>
        </div>
      )}
    </div>
  )
}