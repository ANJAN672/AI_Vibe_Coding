import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      openai_key: !!process.env.OPENAI_API_KEY,
      groq_key: !!process.env.GROQ_API_KEY,
      gemini_key: !!process.env.GEMINI_API_KEY,
      claude_key: !!process.env.CLAUDE_API_KEY,
      mistral_key: !!process.env.MISTRAL_API_KEY,
    }

    const hasAnyLLMKey = Object.entries(envCheck)
      .filter(([key]) => key.includes('_key') && !key.includes('supabase'))
      .some(([_, value]) => value)

    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      deployment: {
        vercel: !!process.env.VERCEL,
        vercel_url: process.env.VERCEL_URL,
        vercel_env: process.env.VERCEL_ENV,
      },
      services: {
        supabase: envCheck.supabase_url && envCheck.supabase_key,
        llm_provider: hasAnyLLMKey,
      },
      environment_variables: envCheck,
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}