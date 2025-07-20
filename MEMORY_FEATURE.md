# 🧠 Chat Memory Feature for n8n Workflow Builder

## Overview

The Chat Memory feature enables **incremental workflow building** - just like Loverbell! Instead of starting from scratch with each prompt, users can build workflows step-by-step in a conversation-style interface.

## ✨ Features

- **🔁 Continuous Building**: Each prompt builds on the previous workflow
- **🧠 Persistent Memory**: Workflows are stored in Supabase for persistence
- **💬 Chat History**: Track all prompts in a session
- **🔄 Session Management**: Start new sessions or clear existing ones
- **🎛️ Toggle Control**: Enable/disable memory mode as needed

## 🚀 How It Works

### Traditional Mode (Memory Disabled)
```
Prompt 1: "Create Airtable trigger" → Fresh workflow with Airtable trigger
Prompt 2: "Add Gmail step" → Fresh workflow with Gmail step (loses Airtable)
```

### Memory Mode (Enabled) ✅
```
Prompt 1: "Create Airtable trigger" → Workflow with Airtable trigger
Prompt 2: "Add Gmail step" → Same workflow + Gmail step (keeps Airtable)
Prompt 3: "Add 2-day delay" → Same workflow + Gmail + Delay step
```

## 🛠️ Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Database Setup

1. Go to your Supabase project
2. Open the SQL Editor
3. Run the SQL from `supabase-setup.sql`

This creates the `chat_workflows` table with proper indexes and RLS policies.

### 3. Test the Feature

1. Start your development server: `npm run dev`
2. Look for the **Chat Memory** toggle in the sidebar
3. Enable memory mode and click "Start Memory Session"
4. Try building a workflow step by step:
   - "Create an Airtable trigger for new records"
   - "Add Clearbit enrichment"
   - "Send Gmail after processing"

## 📊 Database Schema

```sql
TABLE chat_workflows (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,           -- User identifier
  session_id TEXT NOT NULL,        -- Session identifier
  current_workflow JSONB NOT NULL, -- n8n workflow JSON
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(session_id, user_id)
)
```

## 🎯 User Interface

### Memory Toggle Component
- **Location**: Top of sidebar
- **Controls**: Enable/Disable, New Session, Clear Session
- **Status**: Shows active session ID and chat history
- **Visual Feedback**: Purple theme when enabled

### Session Management
- **Auto-Initialize**: Starts session when memory is enabled
- **Persistence**: Saves session ID in localStorage
- **Auto-Save**: Saves workflow after each generation

## 🔧 Technical Implementation

### Core Components

1. **`lib/supabase.ts`** - Database client and operations
2. **`components/MemoryToggle.tsx`** - UI for memory management
3. **`store/workflowStore.ts`** - Updated with session state
4. **Modified generation logic** - Passes existing workflow to AI

### AI Prompt Enhancement

When memory is enabled, the AI receives:

```
This is an ongoing n8n workflow design session.

The existing workflow is:
```json
{existing_workflow_json}
```

The user now said: "{latest_user_prompt}"

Update the existing workflow JSON based on this instruction.
Do not start over. Only add, modify, or connect nodes as needed.
Return valid updated n8n JSON only.
```

## 🎨 Usage Examples

### Building a Complete CRM Workflow

```
💬 "Start with Airtable trigger for new leads"
🤖 Creates workflow with Airtable trigger

💬 "Add Clearbit enrichment to get company data" 
🤖 Adds Clearbit node, connects to Airtable

💬 "Send Slack notification to sales team"
🤖 Adds Slack node, connects to Clearbit

💬 "Add 2-day delay before follow-up email"
🤖 Adds delay node and Gmail node

💬 "Store results back in Airtable"
🤖 Adds final Airtable update node
```

### Result: Complete multi-step workflow built conversationally! 🎉

## 🔒 Security Notes

- User IDs are currently generated client-side for demo purposes
- In production, integrate with your authentication system
- RLS policies should be updated to match your auth setup
- API keys are never stored in the database

## 🐛 Troubleshooting

### Memory Not Working?
1. Check Supabase environment variables
2. Verify database table exists
3. Check browser console for errors
4. Ensure internet connection for Supabase

### Session Not Persisting?
1. Check localStorage for `current_session_id`
2. Verify Supabase connection
3. Check browser network tab for API calls

### Workflow Not Building Incrementally?
1. Ensure memory toggle is enabled (purple state)
2. Check that session is active (shows session ID)
3. Verify AI model is receiving existing workflow in prompt

## 🚀 Future Enhancements

- [ ] Branch/fork workflows from any point
- [ ] Share sessions between users
- [ ] Workflow version history
- [ ] Export chat conversation
- [ ] Template workflows from popular conversations
- [ ] Integration with n8n community workflows

---

**Made with ❤️ for the n8n community** 

This feature transforms workflow building from a one-shot generation into a collaborative conversation with AI! 🤖✨