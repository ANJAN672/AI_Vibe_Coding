import { create } from 'zustand'

export interface N8nNode {
  id: string
  name: string
  type: string
  position: [number, number]
  parameters: Record<string, any>
  credentials?: Record<string, any>
  disabled?: boolean
  notes?: string
  webhookId?: string
  typeVersion?: number
  continueOnFail?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
}

export interface N8nConnection {
  node: string
  type: string
  index: number
}

export interface N8nWorkflow {
  id?: string
  name: string
  nodes: N8nNode[]
  connections: Record<string, Record<string, N8nConnection[][]>>
  active: boolean
  settings: Record<string, any>
  staticData?: Record<string, any>
  tags?: string[]
  meta?: Record<string, any>
}

type AIModel = 'openai' | 'gemini' | 'claude' | 'mistral'

interface WorkflowStore {
  // State
  workflow: N8nWorkflow | null
  jsonCode: string
  isLoading: boolean
  error: string | null
  prompt: string
  streamingText: string
  selectedModel: AIModel
  openaiApiKey: string
  geminiApiKey: string
  claudeApiKey: string
  mistralApiKey: string
  
  // Actions
  setWorkflow: (workflow: N8nWorkflow) => void
  setJsonCode: (code: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPrompt: (prompt: string) => void
  setStreamingText: (text: string) => void
  clearStreamingText: () => void
  setSelectedModel: (model: AIModel) => void
  setOpenaiApiKey: (key: string) => void
  setGeminiApiKey: (key: string) => void
  setClaudeApiKey: (key: string) => void
  setMistralApiKey: (key: string) => void
  generateWorkflow: () => Promise<void>
  exportWorkflow: () => void
  importWorkflow: (json: string) => void
}

const defaultWorkflow: N8nWorkflow = {
  name: "Welcome to AI Vibe Coding Platform",
  nodes: [
    {
      id: "start",
      name: "Start Here",
      type: "n8n-nodes-base.start",
      position: [100, 300],
      parameters: {},
      notes: "Enter a prompt above to generate your n8n workflow!"
    },
    {
      id: "process",
      name: "Process Data",
      type: "n8n-nodes-base.set",
      position: [450, 300],
      parameters: {
        "values": {
          "message": "Welcome to AI Vibe Coding Platform!"
        }
      },
      notes: "This is your AI-powered n8n Workflow Generator. Describe your automation and watch the magic happen!"
    },
    {
      id: "finish",
      name: "Complete",
      type: "n8n-nodes-base.noOp",
      position: [800, 300],
      parameters: {},
      notes: "Your workflow is ready! Try generating a new one with a custom prompt."
    }
  ],
  connections: {
    "Start Here": {
      "main": [
        [
          {
            "node": "Process Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Data": {
      "main": [
        [
          {
            "node": "Complete",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  active: false,
  settings: {
    "executionOrder": "v1"
  },
  tags: ["demo", "welcome"]
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
      // Initial state
      workflow: defaultWorkflow,
      jsonCode: JSON.stringify(defaultWorkflow, null, 2),
      isLoading: false,
      error: null,
      prompt: "",
      streamingText: "",
      selectedModel: 'openai',
      openaiApiKey: "",
      geminiApiKey: "",
      claudeApiKey: "",
      mistralApiKey: "",

      // Actions
      setWorkflow: (workflow) => {
        set({ workflow })
        set({ jsonCode: JSON.stringify(workflow, null, 2) })
      },

      setJsonCode: (code) => {
        set({ jsonCode: code })
        try {
          const workflow = JSON.parse(code)
          set({ workflow, error: null })
        } catch (error) {
          set({ error: "Invalid JSON format" })
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setPrompt: (prompt) => set({ prompt }),
      setStreamingText: (streamingText) => set({ streamingText }),
      clearStreamingText: () => set({ streamingText: '' }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
      setClaudeApiKey: (claudeApiKey) => set({ claudeApiKey }),
      setMistralApiKey: (mistralApiKey) => set({ mistralApiKey }),

      generateWorkflow: async () => {
        const { prompt, selectedModel, openaiApiKey, geminiApiKey, claudeApiKey, mistralApiKey } = get()
        if (!prompt.trim()) {
          set({ error: "Please enter a workflow description" })
          return
        }

        set({ isLoading: true, error: null, streamingText: "" })

        try {
          let apiKey = ""
          switch (selectedModel) {
            case 'openai':
              apiKey = openaiApiKey
              break
            case 'gemini':
              apiKey = geminiApiKey
              break
            case 'claude':
              apiKey = claudeApiKey
              break
            case 'mistral':
              apiKey = mistralApiKey
              break
          }

          if (!apiKey) {
            const modelName = selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)
            throw new Error(`${modelName} API key is required. Please add your API key in settings.`)
          }

          const generatedWorkflow = await generateWorkflow(prompt, selectedModel, apiKey)
          set({ 
            workflow: generatedWorkflow,
            jsonCode: JSON.stringify(generatedWorkflow, null, 2),
            error: null 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate workflow'
          })
        } finally {
          set({ isLoading: false })
        }
      },

      exportWorkflow: () => {
        const { workflow } = get()
        if (!workflow) return
        
        // Create a clean copy for export with proper n8n structure
        const exportWorkflow = {
          ...workflow,
          // Ensure proper n8n structure
          id: workflow.id || undefined,
          name: workflow.name || 'Generated Workflow',
          nodes: workflow.nodes.map(node => ({
            ...node,
            // Ensure node has required fields for n8n
            id: node.id,
            name: node.name,
            type: node.type,
            position: node.position,
            parameters: node.parameters || {},
            ...(node.credentials && { credentials: node.credentials }),
            ...(node.disabled !== undefined && { disabled: node.disabled }),
            ...(node.notes && { notes: node.notes }),
            ...(node.continueOnFail !== undefined && { continueOnFail: node.continueOnFail }),
            ...(node.retryOnFail !== undefined && { retryOnFail: node.retryOnFail }),
            ...(node.maxTries !== undefined && { maxTries: node.maxTries }),
            ...(node.waitBetweenTries !== undefined && { waitBetweenTries: node.waitBetweenTries }),
          })),
          connections: workflow.connections,
          active: workflow.active || false,
          settings: workflow.settings || { executionOrder: 'v1' },
          tags: workflow.tags || [],
          ...(workflow.staticData && { staticData: workflow.staticData }),
          ...(workflow.meta && { meta: workflow.meta }),
        }
        
        const dataStr = JSON.stringify(exportWorkflow, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_')}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
      },

      importWorkflow: (json) => {
        try {
          const workflow = JSON.parse(json)
          set({ 
            workflow,
            jsonCode: JSON.stringify(workflow, null, 2),
            error: null 
          })
        } catch (error) {
          set({ error: "Invalid workflow JSON" })
        }
      },
    }))

// API function for generating workflows
async function generateWorkflow(prompt: string, model: AIModel, apiKey: string): Promise<N8nWorkflow> {
  const SYSTEM_PROMPT = `You are an expert n8n workflow designer. Your task is to convert natural language descriptions into valid n8n workflow JSON.

CRITICAL REQUIREMENTS:
1. Always include a "Start" node as the first node with type "n8n-nodes-base.start"
2. EVERY node MUST be connected in a logical sequence - NO orphaned nodes allowed
3. ALL WORKFLOWS MUST BE FULLY CONNECTED FROM START TO FINISH - Users should see a complete connected workflow immediately
4. MANDATORY: Create connections object that connects ALL nodes in sequence
5. Use the exact n8n connection format with proper node names as keys
6. Position nodes horizontally with 350px spacing for better visibility
7. Include realistic parameters for each node type
8. Generate a descriptive workflow name
9. Return ONLY valid JSON, no explanations or markdown
10. ENSURE COMPLETE CONNECTIVITY - Every node should have a clear path from Start node
11. NEVER CREATE ISOLATED NODES - Every node except the last must have outgoing connections

MANDATORY CONNECTION STRUCTURE:
"connections": {
  "Start": {
    "main": [
      [
        {
          "node": "Next Node Name",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Next Node Name": {
    "main": [
      [
        {
          "node": "Final Node Name",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}

NODE POSITIONING (HORIZONTAL LAYOUT):
- Start node: [100, 300]
- Second node: [450, 300] 
- Third node: [800, 300]
- Fourth node: [1150, 300]
- Continue with 350px horizontal spacing
- For complex workflows, use grid layout with 350px horizontal and 250px vertical spacing

COMPREHENSIVE N8N NODE TYPES:

TRIGGER NODES:
- n8n-nodes-base.start (Manual Start - ALWAYS FIRST)
- n8n-nodes-base.webhook (Webhook Trigger)
- n8n-nodes-base.cron (Schedule Trigger)
- n8n-nodes-base.emailTrigger (Email Trigger)
- n8n-nodes-base.manualTrigger (Manual Trigger)

DATA PROCESSING:
- n8n-nodes-base.httpRequest (HTTP Request)
- n8n-nodes-base.set (Edit Fields/Set Data)
- n8n-nodes-base.function (Function/Code)
- n8n-nodes-base.functionItem (Function Item)
- n8n-nodes-base.merge (Merge Data)
- n8n-nodes-base.split (Split Data)
- n8n-nodes-base.aggregate (Aggregate)
- n8n-nodes-base.sort (Sort)
- n8n-nodes-base.limit (Limit)

LOGIC & FLOW:
- n8n-nodes-base.if (Conditional IF)
- n8n-nodes-base.switch (Switch/Router)
- n8n-nodes-base.wait (Wait/Delay)
- n8n-nodes-base.stopAndError (Stop and Error)

COMMUNICATION:
- n8n-nodes-base.slack (Slack)
- n8n-nodes-base.discord (Discord)
- n8n-nodes-base.telegram (Telegram)
- n8n-nodes-base.emailSend (Send Email)
- n8n-nodes-base.sms (SMS)

CLOUD SERVICES:
- n8n-nodes-base.googleDrive (Google Drive)
- n8n-nodes-base.googleSheets (Google Sheets)
- n8n-nodes-base.googleCalendar (Google Calendar)
- n8n-nodes-base.dropbox (Dropbox)
- n8n-nodes-base.s3 (AWS S3)

DATABASES:
- n8n-nodes-base.mysql (MySQL)
- n8n-nodes-base.postgres (PostgreSQL)
- n8n-nodes-base.mongodb (MongoDB)
- n8n-nodes-base.redis (Redis)
- n8n-nodes-base.airtable (Airtable)

DEVELOPMENT:
- n8n-nodes-base.github (GitHub)
- n8n-nodes-base.gitlab (GitLab)
- n8n-nodes-base.jira (Jira)

CRM & BUSINESS:
- n8n-nodes-base.hubspot (HubSpot)
- n8n-nodes-base.salesforce (Salesforce)
- n8n-nodes-base.notion (Notion)
- n8n-nodes-base.trello (Trello)

EXAMPLE WORKFLOW STRUCTURE (3 CONNECTED NODES):
{
  "name": "Example Workflow",
  "nodes": [
    {
      "id": "start-node",
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [100, 300],
      "parameters": {}
    },
    {
      "id": "http-node", 
      "name": "Fetch Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.example.com/data"
      }
    },
    {
      "id": "process-node",
      "name": "Process Data",
      "type": "n8n-nodes-base.set",
      "position": [800, 300],
      "parameters": {
        "values": {
          "processed": "true"
        }
      }
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [
          {
            "node": "Fetch Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Data": {
      "main": [
        [
          {
            "node": "Process Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  }
}

EMAIL NODE EXAMPLE (Always include proper parameters for email nodes):
{
  "id": "email-node",
  "name": "Send Email",
  "type": "n8n-nodes-base.emailSend",
  "position": [800, 300],
  "parameters": {
    "to": "recipient@example.com",
    "subject": "Notification from n8n",
    "text": "This is an automated message from your n8n workflow.",
    "from": "noreply@example.com"
  }
}

VALIDATION CHECKLIST:
✓ Start node is first with type "n8n-nodes-base.start"
✓ All nodes have unique names and IDs
✓ Every node (except last) has outgoing connections
✓ Every node (except first) has incoming connections
✓ Connections use exact node names as specified in nodes array
✓ Positions follow horizontal layout with 350px spacing
✓ Parameters are realistic for each node type

ENSURE COMPLETE CONNECTIVITY - NO ISOLATED NODES!`

  let response: Response

  if (model === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Create an n8n workflow for: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
  } else if (model === 'gemini') {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${SYSTEM_PROMPT}\n\nCreate an n8n workflow for: ${prompt}` }]
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      }),
    })
  } else if (model === 'claude') {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: `${SYSTEM_PROMPT}\n\nCreate an n8n workflow for: ${prompt}` }
        ]
      }),
    })
  } else if (model === 'mistral') {
    response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Create an n8n workflow for: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
  } else {
    throw new Error('Unsupported AI model')
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`API error: ${errorData.error?.message || errorData.message || 'Unknown error'}`)
  }

  const data = await response.json()
  let workflowJson: string

  if (model === 'openai' || model === 'mistral') {
    workflowJson = data.choices[0]?.message?.content
  } else if (model === 'gemini') {
    workflowJson = data.candidates[0]?.content?.parts[0]?.text
  } else if (model === 'claude') {
    workflowJson = data.content[0]?.text
  } else {
    throw new Error('Unsupported model response format')
  }

  if (!workflowJson) {
    throw new Error('No workflow generated')
  }

  // Parse and validate the JSON
  let workflow: N8nWorkflow
  try {
    workflow = JSON.parse(workflowJson)
  } catch (parseError) {
    const jsonMatch = workflowJson.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      workflow = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Invalid JSON generated by AI')
    }
  }

  // Validate the workflow structure
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Invalid workflow: missing or invalid nodes')
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    workflow.connections = {}
  }

  // Fix connections structure - ensure all connection arrays are properly formatted
  Object.keys(workflow.connections).forEach(nodeName => {
    const nodeConnections = workflow.connections[nodeName]
    if (nodeConnections && typeof nodeConnections === 'object') {
      Object.keys(nodeConnections).forEach(outputType => {
        const outputs = nodeConnections[outputType]
        if (outputs && Array.isArray(outputs)) {
          // Ensure each output is an array of connection arrays
          nodeConnections[outputType] = outputs.map(output => {
            if (Array.isArray(output)) {
              return output
            } else if (output && typeof output === 'object') {
              // Convert single connection object to array
              return [output]
            } else {
              return []
            }
          })
        } else if (outputs && typeof outputs === 'object') {
          // Convert single connection to proper format
          nodeConnections[outputType] = [[outputs]]
        } else {
          nodeConnections[outputType] = []
        }
      })
    }
  })

  // Enhanced connection validation and auto-connection
  if (workflow.nodes.length > 1) {
    // Check for orphaned nodes and auto-connect if needed
    const connectedNodes = new Set<string>()
    const hasIncomingConnection = new Set<string>()
    
    // Track all connected nodes
    Object.entries(workflow.connections).forEach(([sourceNodeName, connections]) => {
      if (connections && typeof connections === 'object') {
        connectedNodes.add(sourceNodeName)
        Object.values(connections).forEach(outputConnections => {
          if (Array.isArray(outputConnections)) {
            outputConnections.forEach(connectionArray => {
              if (Array.isArray(connectionArray)) {
                connectionArray.forEach(connection => {
                  if (connection && connection.node) {
                    hasIncomingConnection.add(connection.node)
                  }
                })
              }
            })
          }
        })
      }
    })
    
    // Auto-connect orphaned nodes in sequence
    if (Object.keys(workflow.connections).length === 0 || connectedNodes.size < workflow.nodes.length - 1) {
      for (let i = 0; i < workflow.nodes.length - 1; i++) {
        const currentNode = workflow.nodes[i]
        const nextNode = workflow.nodes[i + 1]
        
        if (!workflow.connections[currentNode.name]) {
          workflow.connections[currentNode.name] = {}
        }
        
        if (!workflow.connections[currentNode.name].main) {
          workflow.connections[currentNode.name].main = []
        }
        
        // Only add connection if it doesn't exist
        const connectionExists = workflow.connections[currentNode.name].main.some(connArray =>
          connArray.some(conn => conn.node === nextNode.name)
        )
        
        if (!connectionExists) {
          workflow.connections[currentNode.name].main.push([{
            node: nextNode.name,
            type: 'main',
            index: 0
          }])
        }
      }
    }
  }

  // Ensure required fields
  workflow.active = workflow.active ?? false
  workflow.settings = workflow.settings ?? { executionOrder: 'v1' }
  workflow.tags = workflow.tags ?? []

  return workflow
}