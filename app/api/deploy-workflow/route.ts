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
    
    let authResponse: Response
    try {
      authResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })
    } catch (error) {
      console.error('Network error during authentication:', error)
      return NextResponse.json(
        { error: 'Unable to connect to n8n instance. Please check the host URL.' },
        { status: 500 }
      )
    }

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
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
      name: workflow.name,
      nodes: workflow.nodes.map(node => ({
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
        typeVersion: node.typeVersion || 1,
      })),
      connections: workflow.connections || {},
      active: workflow.active || false,
      settings: workflow.settings || { executionOrder: 'v1' },
      tags: workflow.tags || [],
      ...(workflow.staticData && { staticData: workflow.staticData }),
      ...(workflow.meta && { meta: workflow.meta }),
    }

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

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Workflow deployed successfully',
      workflowId: workflowResult.data?.id,
      workflowName: workflowResult.data?.name,
      n8nUrl: `${n8nUrl.origin}/workflow/${workflowResult.data?.id}`,
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error during deployment' },
      { status: 500 }
    )
  }
}