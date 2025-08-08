# 🚀 Vercel Deployment Guide for AgentX Vibe Coding Platform

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables Setup**
Before deploying to Vercel, you need to configure the following environment variables in your Vercel dashboard:

#### Required Variables:
```env
# Supabase (Required for chat memory)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# LLM API Keys (At least one required)
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key  
GEMINI_API_KEY=your_gemini_api_key
CLAUDE_API_KEY=your_claude_api_key
MISTRAL_API_KEY=your_mistral_api_key

# Default provider
DEFAULT_LLM_PROVIDER=openai
```

#### Optional Variables:
```env
# n8n Integration (optional)
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_API_KEY=your_n8n_api_key
```

### 2. **Supabase Database Setup**
Ensure your Supabase database is set up with the required tables:

```sql
-- Run this in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS chat_workflows (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  session_name VARCHAR(500) DEFAULT 'New Chat',
  current_workflow JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  workflow_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_workflows_session_user ON chat_workflows(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_user ON chat_messages(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_workflows_user_updated ON chat_workflows(user_id, updated_at);
```

### 3. **Build Configuration**
The project includes proper build configuration:
- ✅ `next.config.js` properly configured
- ✅ `vercel.json` created with function timeouts
- ✅ TypeScript configuration ready
- ✅ All dependencies properly declared

### 4. **API Routes Ready**
- ✅ `/api/deploy-workflow` - n8n deployment endpoint
- ✅ `/api/debug-supabase` - Supabase connection testing

## 🔧 Deployment Steps

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Import Project"
4. Import your GitHub repository

### Step 2: Configure Environment Variables
1. In Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add all the environment variables listed above
4. Make sure to set them for all environments (Production, Preview, Development)

### Step 3: Configure Build Settings
Vercel should auto-detect Next.js, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (leave empty, auto-detected)
- **Install Command**: `npm install`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Test the deployment

## 🧪 Post-Deployment Testing

### Test Checklist:
1. **✅ Basic App Loading**
   - Visit your Vercel URL
   - Verify the app loads without errors

2. **✅ Environment Variables**
   - Check if Supabase connection works
   - Test LLM API key functionality
   - Visit `/api/debug-supabase` to verify database connection

3. **✅ Core Features**
   - Generate a workflow
   - Test chat memory functionality
   - Test workflow export/import
   - Test n8n deployment (if configured)

4. **✅ UI Components**
   - Verify all UI components render correctly
   - Test responsive design
   - Check dark/light mode switching

## 🚨 Troubleshooting

### Common Issues:

#### Build Errors
```bash
# If build fails, check:
npm run build
npm run lint
```

#### Environment Variable Issues
- Verify all variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Ensure Supabase keys are from the correct project

#### Database Connection Issues
- Verify Supabase URL and anon key
- Check if database tables exist
- Test connection at `/api/debug-supabase`

#### API Route Timeouts
- n8n deployment may take up to 30 seconds
- Function timeouts are configured in `vercel.json`

### Performance Optimization
- ✅ Static assets optimized
- ✅ API routes with proper timeouts
- ✅ Database queries optimized with indexes
- ✅ Client-side state management with Zustand

## 🔒 Security Considerations

- ✅ Environment variables properly secured
- ✅ API keys not exposed to client-side
- ✅ Supabase RLS policies recommended
- ✅ Input validation in API routes

## 📊 Monitoring & Analytics

After deployment, consider adding:
- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring
- Usage analytics

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Test locally with `npm run build && npm start`
3. Verify all environment variables
4. Check Supabase connection

---

## 🎉 You're Ready to Deploy!

Your AgentX Vibe Coding Platform is now deployment-ready for Vercel. Follow the steps above and you'll have a fully functional AI workflow generator running in production!