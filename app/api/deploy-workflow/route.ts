import { NextRequest, NextResponse } from 'next/server'
import { N8nWorkflow } from '@/store/workflowStore'

interface DeploymentRequest {
  workflow: N8nWorkflow
  credentials: {
    hostUrl: string
    apiKey: string
  }
}

interface N8nWorkflowResponse {
  data?: {
    id: string
    name: string
    active: boolean
    createdAt: string
    updatedAt: string
  }
  // n8n might return data directly without wrapper
  id?: string
  name?: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

interface N8nHealthResponse {
  status: string
  version?: string
}

// Helper function to test n8n connection
async function testN8nConnection(hostUrl: string, apiKey?: string): Promise<{ success: boolean; error?: string; version?: string }> {
  try {
    const healthUrl = `${hostUrl}/healthz`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(apiKey && { 'X-N8N-API-KEY': apiKey })
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json() as N8nHealthResponse
      return { 
        success: true, 
        ...(data.version && { version: data.version })
      }
    } else {
      return { success: false, error: `Health check failed: ${response.status}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Helper function to authenticate with n8n using API key
async function authenticateWithApiKey(hostUrl: string, apiKey: string): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Try multiple endpoints to get user information and validate API key
    const endpoints = [
      `${hostUrl}/api/v1/me`,
      `${hostUrl}/api/v1/users/me`, 
      `${hostUrl}/api/v1/workflows?limit=1`
    ]
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying authentication endpoint: ${endpoint}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-N8N-API-KEY': apiKey
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          console.log(`Authentication successful via ${endpoint}:`, data)
          
          // Extract user ID if available
          let userId = undefined
          if (data.id) {
            userId = data.id
          } else if (data.data && data.data.length > 0 && endpoint.includes('workflows')) {
            // For workflows endpoint, we can infer the API key works
            console.log('API key validated via workflows endpoint')
          }
          
          return { success: true, userId }
        } else if (response.status === 401) {
          console.log(`Authentication failed at ${endpoint}: Invalid API key`)
          continue // Try next endpoint
        } else {
          console.log(`Endpoint ${endpoint} returned status ${response.status}`)
          continue // Try next endpoint
        }
      } catch (error) {
        console.log(`Error with endpoint ${endpoint}:`, error)
        continue // Try next endpoint
      }
    }
    
    // If all endpoints failed
    return { success: false, error: 'Invalid API key or n8n instance not accessible' }
    
  } catch (error) {
    return { success: false, error: `API key validation error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentRequest = await request.json()
    const { workflow, credentials } = body

    // Validate request
    if (!workflow || !credentials) {
      return NextResponse.json(
        { error: 'Missing workflow or credentials' },
        { status: 400 }
      )
    }

    if (!credentials.hostUrl) {
      return NextResponse.json(
        { error: 'Missing required hostUrl' },
        { status: 400 }
      )
    }

    // Check if we have API key (only authentication method supported)
    if (!credentials.apiKey || credentials.apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'n8n API key is required. Please create an API key in n8n: Settings → n8n API → Create API Key' },
        { status: 400 }
      )
    }

    // Validate URL format
    let n8nUrl: URL
    try {
      n8nUrl = new URL(credentials.hostUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid n8n host URL format' },
        { status: 400 }
      )
    }

    console.log('Testing n8n connection:', n8nUrl.origin)

    // Step 1: Test connection to n8n instance
    const connectionTest = await testN8nConnection(n8nUrl.origin, credentials.apiKey)
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Unable to connect to n8n instance: ${connectionTest.error}` },
        { status: 500 }
      )
    }

    console.log('n8n connection successful, version:', connectionTest.version)

    // Step 2: Authenticate with n8n using API key
    console.log('Using API key authentication')
    const apiKeyAuth = await authenticateWithApiKey(n8nUrl.origin, credentials.apiKey)
    if (!apiKeyAuth.success) {
      return NextResponse.json(
        { error: apiKeyAuth.error || 'API key authentication failed' },
        { status: 401 }
      )
    }
    
    console.log('Authentication successful, user ID:', apiKeyAuth.userId)
    
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-N8N-API-KEY': credentials.apiKey
    }

    // Step 3: Prepare workflow for n8n (exclude read-only fields like 'active' and 'tags')
    const n8nWorkflow = {
      name: workflow.name || 'Deployed Workflow',
      nodes: workflow.nodes.map((node, index) => {
        // Ensure position is in the correct format [x, y]
        const position = Array.isArray(node.position) && node.position.length === 2 
          ? node.position 
          : [100 + index * 350, 300]

        // Clean up parameters to avoid property option issues
        const cleanParameters = node.parameters ? { ...node.parameters } : {}
        
        // Remove any undefined or null values that might cause issues
        Object.keys(cleanParameters).forEach(key => {
          if (cleanParameters[key] === undefined || cleanParameters[key] === null) {
            delete cleanParameters[key]
          }
        })

        // Fix common parameter issues for specific node types
        if (node.type === 'n8n-nodes-base.httpRequest') {
          // Ensure method is valid
          if (cleanParameters.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(cleanParameters.method.toString().toUpperCase())) {
            cleanParameters.method = 'GET'
          }
          // Set default authentication if not specified
          if (!cleanParameters.authentication) {
            cleanParameters.authentication = 'none'
          }
        }

        if (node.type === 'n8n-nodes-base.webhook') {
          // Ensure HTTP method is valid for webhook
          if (cleanParameters.httpMethod && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(cleanParameters.httpMethod.toString().toUpperCase())) {
            cleanParameters.httpMethod = 'POST'
          }
          // Set default response mode
          if (!cleanParameters.responseMode) {
            cleanParameters.responseMode = 'onReceived'
          }
        }

        if (node.type === 'n8n-nodes-base.emailSend') {
          // Ensure email parameters are strings
          if (cleanParameters.to) cleanParameters.to = cleanParameters.to.toString()
          if (cleanParameters.subject) cleanParameters.subject = cleanParameters.subject.toString()
          if (cleanParameters.text) cleanParameters.text = cleanParameters.text.toString()
          if (cleanParameters.from) cleanParameters.from = cleanParameters.from.toString()
        }

        if (node.type === 'n8n-nodes-base.set') {
          // Fix Set node parameters format
          if (cleanParameters.values && typeof cleanParameters.values === 'object') {
            // If values is in old format, convert to new format
            if (!cleanParameters.values.string && !cleanParameters.values.number && !cleanParameters.values.boolean) {
              const stringValues = []
              for (const [key, value] of Object.entries(cleanParameters.values)) {
                stringValues.push({
                  name: key,
                  value: value?.toString() || ''
                })
              }
              cleanParameters.values = { string: stringValues }
            }
          }
        }

        if (node.type === 'n8n-nodes-base.function') {
          // Ensure function code is properly formatted
          if (cleanParameters.functionCode) {
            cleanParameters.functionCode = cleanParameters.functionCode.toString()
          }
        }

        return {
          id: node.id || `node-${index}`,
          name: node.name || `Node ${index + 1}`,
          type: node.type,
          position,
          parameters: cleanParameters,
          typeVersion: node.typeVersion || 1,
          ...(node.credentials && Object.keys(node.credentials).length > 0 && { credentials: node.credentials }),
          ...(node.disabled !== undefined && { disabled: Boolean(node.disabled) }),
          ...(node.notes && { notes: node.notes }),
          ...(node.continueOnFail !== undefined && { continueOnFail: Boolean(node.continueOnFail) }),
          ...(node.retryOnFail !== undefined && { retryOnFail: Boolean(node.retryOnFail) }),
          ...(node.maxTries && { maxTries: Number(node.maxTries) }),
          ...(node.waitBetweenTries && { waitBetweenTries: Number(node.waitBetweenTries) }),
        }
      }),
      connections: workflow.connections || {},
      // Remove 'active' and 'tags' fields as they are read-only - we'll handle activation separately
      settings: {
        executionOrder: 'v1',
        ...(workflow.settings || {})
      },
      ...(workflow.staticData && { staticData: workflow.staticData }),
    }
    
    // Store the desired active state for later activation
    const shouldActivate = Boolean(workflow.active)

    // Log the prepared workflow for debugging
    console.log('Prepared workflow:', JSON.stringify(n8nWorkflow, null, 2))

    // Step 4: Create workflow in n8n using API key (only API key authentication supported)
    const createWorkflowUrl = `${n8nUrl.origin}/api/v1/workflows`
    
    console.log('Creating workflow at:', createWorkflowUrl)
    
    let createResponse: Response
    try {
      createResponse = await fetch(createWorkflowUrl, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(n8nWorkflow),
      })
    } catch (error) {
      console.error('Network error during workflow creation:', error)
      return NextResponse.json(
        { error: 'Network error while creating workflow' },
        { status: 500 }
      )
    }

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('Workflow creation failed:', createResponse.status, errorText)
      
      let errorMessage = 'Failed to create workflow in n8n'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch {
        // Use default error message if parsing fails
      }

      if (createResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your n8n API key.' },
          { status: 401 }
        )
      } else if (createResponse.status === 400) {
        // Log detailed error for debugging
        console.error('400 Error details:', errorText)
        
        return NextResponse.json(
          { error: `Invalid workflow data: ${errorMessage}` },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: `Workflow creation failed: ${errorMessage}` },
          { status: createResponse.status }
        )
      }
    }

    const workflowResult: N8nWorkflowResponse = await createResponse.json()
    
    // Log the actual response structure for debugging
    console.log('n8n API Response:', JSON.stringify(workflowResult, null, 2))
    
    // Handle different response formats - n8n API might return data directly or wrapped in 'data'
    const workflowData = workflowResult.data || workflowResult
    const workflowId = workflowData.id
    const workflowName = workflowData.name
    
    if (!workflowId) {
      console.error('No workflow ID found in response:', workflowResult)
      return NextResponse.json(
        { error: 'Workflow created but no ID returned from n8n. Please check your n8n instance logs.' },
        { status: 500 }
      )
    }
    
    console.log('Created workflow with ID:', workflowId, 'Name:', workflowName)

    // Step 5: Activate the workflow if it should be active
    if (shouldActivate && workflowId) {
      try {
        const activateUrl = `${n8nUrl.origin}/api/v1/workflows/${workflowId}/activate`
        
        console.log('Activating workflow at:', activateUrl)
        
        const activateResponse = await fetch(activateUrl, {
          method: 'POST',
          headers: authHeaders,
        })

        if (!activateResponse.ok) {
          console.warn('Failed to activate workflow, but creation was successful')
        } else {
          console.log('Workflow activated successfully')
        }
      } catch (error) {
        console.warn('Error activating workflow:', error)
        // Don't fail the entire deployment if activation fails
      }
    }

    // Step 6: Add tags if needed (after workflow creation)
    if (workflow.tags && Array.isArray(workflow.tags) && workflow.tags.length > 0 && workflowId) {
      try {
        const updateUrl = `${n8nUrl.origin}/api/v1/workflows/${workflowId}`
        
        console.log('Adding tags to workflow:', workflow.tags)
        
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ tags: workflow.tags }),
        })

        if (!updateResponse.ok) {
          console.warn('Failed to add tags to workflow, but creation was successful')
        } else {
          console.log('Tags added successfully')
        }
      } catch (error) {
        console.warn('Error adding tags to workflow:', error)
        // Don't fail the entire deployment if tag addition fails
      }
    }

    // Step 7: Verify workflow was created and is accessible
    let verificationResult = null
    let workflowAccessible = false
    
    if (workflowId) {
      // Wait a bit for n8n to process the workflow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Try multiple approaches to verify workflow access
      const verificationMethods = [
        `${n8nUrl.origin}/api/v1/workflows/${workflowId}`,
        `${n8nUrl.origin}/api/v1/workflows/${workflowId}?includeData=true`,
      ]
      
      for (const fetchUrl of verificationMethods) {
        try {
          console.log('Verifying workflow access at:', fetchUrl)
          
          const fetchResponse = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'X-N8N-API-KEY': credentials.apiKey!,
              'Content-Type': 'application/json'
            },
          })
          
          if (fetchResponse.ok) {
            verificationResult = await fetchResponse.json()
            workflowAccessible = true
            console.log('Workflow verification successful - workflow is accessible via', fetchUrl)
            break
          } else {
            const errorText = await fetchResponse.text()
            console.warn(`Could not verify workflow access via ${fetchUrl}:`, fetchResponse.status, errorText)
            
            if (fetchResponse.status === 404) {
              console.error('Workflow created but not accessible - possible ownership issue')
            }
          }
        } catch (error) {
          console.warn(`Error verifying workflow via ${fetchUrl}:`, error)
        }
      }
      
      // If direct access fails, try listing all workflows to see if it appears there
      if (!workflowAccessible) {
        try {
          console.log('Trying to find workflow in user\'s workflow list...')
          const listResponse = await fetch(`${n8nUrl.origin}/api/v1/workflows`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'X-N8N-API-KEY': credentials.apiKey!
            },
          })
          
          if (listResponse.ok) {
            const workflowsList = await listResponse.json()
            const foundWorkflow = workflowsList.data?.find((wf: any) => wf.id === workflowId)
            if (foundWorkflow) {
              console.log('Workflow found in user\'s workflow list:', foundWorkflow)
              workflowAccessible = true
              verificationResult = foundWorkflow
            } else {
              console.error('Workflow not found in user\'s workflow list - ownership issue confirmed')
            }
          }
        } catch (error) {
          console.warn('Error checking workflow list:', error)
        }
      }
    }

    // Success response
    const responseData = {
      success: true,
      message: workflowAccessible 
        ? 'Workflow deployed successfully' 
        : 'Workflow deployed but may have accessibility issues',
      workflowId: workflowId,
      workflowName: workflowName || workflow.name,
      n8nUrl: workflowAccessible 
        ? `${n8nUrl.origin}/workflow/${workflowId}` 
        : `${n8nUrl.origin}/workflows`, // Fallback to workflows list
      editUrl: `${n8nUrl.origin}/workflow/${workflowId}`,
      fallbackUrl: `${n8nUrl.origin}/workflows`, // Always provide fallback to workflows list
      verified: !!verificationResult,
      accessible: workflowAccessible,
      warning: !workflowAccessible ? 'Workflow created but may not be directly accessible. Try accessing it from the workflows list in n8n.' : undefined
    }
    
    console.log('Deployment response:', responseData)
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error during deployment' },
      { status: 500 }
    )
  }
}