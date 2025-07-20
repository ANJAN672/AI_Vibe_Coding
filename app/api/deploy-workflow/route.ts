import { NextRequest, NextResponse } from 'next/server'
import { N8nWorkflow } from '@/store/workflowStore'

interface DeploymentRequest {
  workflow: N8nWorkflow
  credentials: {
    hostUrl: string
    email: string
    password: string
  }
}

interface N8nAuthResponse {
  data: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

interface N8nWorkflowResponse {
  data: {
    id: string
    name: string
    active: boolean
    createdAt: string
    updatedAt: string
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

    if (!credentials.hostUrl || !credentials.email || !credentials.password) {
      return NextResponse.json(
        { error: 'Missing required credentials (hostUrl, email, password)' },
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

    // Step 1: Authenticate with n8n
    const loginUrl = `${n8nUrl.origin}/rest/login`
    
    const authPayload = {
      emailOrLdapLoginId: credentials.email,
      password: credentials.password,
    }
    
    console.log('Attempting authentication with n8n:', loginUrl)
    console.log('Auth payload keys:', Object.keys(authPayload))
    
    let authResponse: Response
    try {
      authResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(authPayload),
      })
    } catch (error) {
      console.error('Network error during authentication:', error)
      return NextResponse.json(
        { error: 'Unable to connect to n8n instance. Please check the host URL.' },
        { status: 500 }
      )
    }

    if (!authResponse.ok) {
      let errorText = ''
      let errorData: any = null
      
      try {
        errorText = await authResponse.text()
        // Try to parse as JSON for better error details
        if (errorText) {
          try {
            errorData = JSON.parse(errorText)
          } catch {
            // If not JSON, keep as text
          }
        }
      } catch (e) {
        console.error('Error reading auth response:', e)
      }
      
      console.error('Authentication failed:', authResponse.status, errorText)
      
      if (authResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      } else if (authResponse.status === 404) {
        return NextResponse.json(
          { error: 'n8n instance not found. Please check the host URL.' },
          { status: 404 }
        )
      } else if (authResponse.status === 400) {
        // Better handling for 400 errors with detailed message
        const detailMsg = errorData ? JSON.stringify(errorData) : errorText
        return NextResponse.json(
          { error: `Authentication failed: ${authResponse.status} ${detailMsg}` },
          { status: authResponse.status }
        )
      } else {
        return NextResponse.json(
          { error: `Authentication failed: ${authResponse.status}` },
          { status: authResponse.status }
        )
      }
    }

    // Extract session cookie from response
    const setCookieHeader = authResponse.headers.get('set-cookie')
    if (!setCookieHeader) {
      return NextResponse.json(
        { error: 'No session cookie received from n8n' },
        { status: 500 }
      )
    }

    // Parse the session cookie
    const sessionCookie = setCookieHeader.split(';')[0] // Get the first cookie (usually n8n-auth)

    // Step 2: Prepare workflow for n8n
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
      active: Boolean(workflow.active),
      settings: {
        executionOrder: 'v1',
        ...(workflow.settings || {})
      },
      tags: Array.isArray(workflow.tags) ? workflow.tags : [],
      ...(workflow.staticData && { staticData: workflow.staticData }),
    }

    // Log the prepared workflow for debugging
    console.log('Prepared workflow:', JSON.stringify(n8nWorkflow, null, 2))

    // Step 3: Create workflow in n8n
    const createWorkflowUrl = `${n8nUrl.origin}/rest/workflows`
    
    let createResponse: Response
    try {
      createResponse = await fetch(createWorkflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': sessionCookie,
        },
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
          { error: 'Session expired. Please try again.' },
          { status: 401 }
        )
      } else if (createResponse.status === 400) {
        // Log detailed error for debugging
        console.error('400 Error details:', errorText)
        
        // Check for specific error types
        if (errorText.includes('property option')) {
          return NextResponse.json(
            { error: `Property option error: Some node parameters have invalid values. ${errorMessage}` },
            { status: 400 }
          )
        } else if (errorText.includes('workflow')) {
          return NextResponse.json(
            { error: `Workflow validation error: ${errorMessage}` },
            { status: 400 }
          )
        } else {
          return NextResponse.json(
            { error: `Invalid workflow data: ${errorMessage}` },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: `Workflow creation failed: ${errorMessage}` },
          { status: createResponse.status }
        )
      }
    }

    const workflowResult: N8nWorkflowResponse = await createResponse.json()

    // Step 4: Optionally activate the workflow if it was active
    if (workflow.active && workflowResult.data?.id) {
      try {
        const activateUrl = `${n8nUrl.origin}/rest/workflows/${workflowResult.data.id}/activate`
        const activateResponse = await fetch(activateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': sessionCookie,
          },
        })

        if (!activateResponse.ok) {
          console.warn('Failed to activate workflow, but creation was successful')
        }
      } catch (error) {
        console.warn('Error activating workflow:', error)
        // Don't fail the entire deployment if activation fails
      }
    }

    // Verify workflow was created by fetching it back
    let verificationResult = null
    if (workflowResult.data?.id) {
      // Wait a bit for n8n to process the workflow
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        const fetchUrl = `${n8nUrl.origin}/rest/workflows/${workflowResult.data.id}`
        console.log('Verifying workflow at:', fetchUrl)
        
        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cookie': sessionCookie,
          },
        })
        
        if (fetchResponse.ok) {
          verificationResult = await fetchResponse.json()
          console.log('Workflow verification successful')
        } else {
          const errorText = await fetchResponse.text()
          console.warn('Could not verify workflow creation:', fetchResponse.status, errorText)
        }
      } catch (error) {
        console.warn('Error verifying workflow:', error)
      }
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Workflow deployed successfully',
      workflowId: workflowResult.data?.id,
      workflowName: workflowResult.data?.name,
      n8nUrl: `${n8nUrl.origin}/workflow/${workflowResult.data?.id}`,
      editUrl: `${n8nUrl.origin}/workflows/${workflowResult.data?.id}`,
      verified: !!verificationResult,
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error during deployment' },
      { status: 500 }
    )
  }
}