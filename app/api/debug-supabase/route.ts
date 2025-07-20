import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    console.log('🧪 Debug API Route - Testing Supabase Connection')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Missing ❌')
    console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌')

    // Test 1: Basic connection test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('chat_workflows')
      .select('count')
      .limit(1)

    // Test 2: Try to fetch recent sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_workflows')
      .select('session_id, session_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // Test 3: Try to fetch recent messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('session_id, role, content, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌'
      },
      tests: {
        connection: {
          success: !connectionError,
          error: connectionError?.message || null,
          data: connectionTest
        },
        sessions: {
          success: !sessionsError,
          error: sessionsError?.message || null,
          count: sessions?.length || 0,
          data: sessions || []
        },
        messages: {
          success: !messagesError,
          error: messagesError?.message || null,
          count: messages?.length || 0,
          data: messages || []
        }
      }
    })
  } catch (error) {
    console.error('❌ Debug API Error:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌'
      }
    }, { status: 500 })
  }
}

// Test write functionality
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('🧪 Debug API - Testing Supabase Write')
    
    // Create a test session
    const testSessionId = `debug-${Date.now()}`
    const testUserId = 'debug-user'
    
    const { data, error } = await supabase
      .from('chat_workflows')
      .insert({
        session_id: testSessionId,
        user_id: testUserId,
        session_name: 'Debug Test Session',
        current_workflow: { name: 'Test Workflow', nodes: [], connections: {} }
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Clean up test data
    await supabase
      .from('chat_workflows')
      .delete()
      .eq('session_id', testSessionId)

    return NextResponse.json({
      success: true,
      message: 'Write test successful - created and deleted test session',
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}