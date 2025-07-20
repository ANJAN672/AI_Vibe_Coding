'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | 'hidden'>('testing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Testing Supabase connection...')
        
        // Simple connection test
        const { data, error } = await supabase
          .from('chat_workflows')
          .select('count')
          .limit(1)
          
        if (error) {
          console.error('❌ Supabase connection failed:', error)
          setConnectionStatus('failed')
          setError(error.message)
        } else {
          console.log('✅ Supabase connection successful!')
          setConnectionStatus('connected')
          
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setConnectionStatus('hidden')
          }, 3000)
        }
      } catch (err) {
        console.error('❌ Network error:', err)
        setConnectionStatus('failed')
        setError(err instanceof Error ? err.message : 'Network error')
      }
    }

    testConnection()
  }, [])

  if (connectionStatus === 'testing') {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm z-50">
        🧪 Testing Supabase connection...
      </div>
    )
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-300 rounded-lg p-3 text-sm z-50 max-w-sm">
        <div className="font-medium text-red-800">❌ Supabase Connection Failed</div>
        <div className="text-red-600 mt-1">{error}</div>
      </div>
    )
  }

  // Don't render anything if hidden or connected (after timeout)
  if (connectionStatus === 'hidden') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3 text-sm z-50">
      ✅ Supabase Connected
    </div>
  )
}