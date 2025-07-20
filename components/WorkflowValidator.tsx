'use client'

import { useEffect, useMemo } from 'react'
import { N8nWorkflow, N8nNode } from '@/store/workflowStore'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  disconnectedNodes: string[]
  missingTrigger: boolean
}

export interface ValidationError {
  type: 'error'
  message: string
  nodeId?: string
  nodeName?: string
}

export interface ValidationWarning {
  type: 'warning'
  message: string
  nodeId?: string
  nodeName?: string
}

interface WorkflowValidatorProps {
  workflow: N8nWorkflow | null
  onValidationResult?: (result: ValidationResult) => void
  showVisualFeedback?: boolean
}

export function validateWorkflow(workflow: N8nWorkflow | null): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    disconnectedNodes: [],
    missingTrigger: false
  }

  if (!workflow) {
    result.isValid = false
    result.errors.push({
      type: 'error',
      message: 'No workflow to validate'
    })
    return result
  }

  // Check if workflow has nodes
  if (!workflow.nodes || workflow.nodes.length === 0) {
    result.isValid = false
    result.errors.push({
      type: 'error',
      message: 'Workflow must contain at least one node'
    })
    return result
  }

  // Check for trigger nodes (Start, Webhook, Cron, etc.)
  const triggerNodeTypes = [
    'n8n-nodes-base.start',
    'n8n-nodes-base.manualTrigger',
    'n8n-nodes-base.webhook',
    'n8n-nodes-base.cron',
    'n8n-nodes-base.httpRequest',
    'n8n-nodes-base.emailTrigger',
    'n8n-nodes-base.slackTrigger'
  ]

  const hasTriggerNode = workflow.nodes.some(node => 
    triggerNodeTypes.includes(node.type)
  )

  if (!hasTriggerNode) {
    result.isValid = false
    result.missingTrigger = true
    result.errors.push({
      type: 'error',
      message: 'Workflow must have at least one trigger node (Start, Webhook, Cron, etc.)'
    })
  }

  // Build connection graph
  const connectedNodeNames = new Set<string>()
  const nodeConnections = new Map<string, string[]>()

  // Process connections
  Object.entries(workflow.connections || {}).forEach(([sourceName, connections]) => {
    connectedNodeNames.add(sourceName)
    
    if (!nodeConnections.has(sourceName)) {
      nodeConnections.set(sourceName, [])
    }

    Object.values(connections).forEach(outputConnections => {
      outputConnections.forEach(connectionArray => {
        connectionArray.forEach(connection => {
          connectedNodeNames.add(connection.node)
          nodeConnections.get(sourceName)?.push(connection.node)
        })
      })
    })
  })

  // Find disconnected nodes
  if (workflow.nodes.length > 1) {
    const isolatedNodes = workflow.nodes.filter(node => !connectedNodeNames.has(node.name))
    
    isolatedNodes.forEach(node => {
      result.disconnectedNodes.push(node.id)
      
      if (triggerNodeTypes.includes(node.type)) {
        result.warnings.push({
          type: 'warning',
          message: `Trigger node "${node.name}" is not connected to any other nodes`,
          nodeId: node.id,
          nodeName: node.name
        })
      } else {
        result.isValid = false
        result.errors.push({
          type: 'error',
          message: `Node "${node.name}" is not connected to the workflow`,
          nodeId: node.id,
          nodeName: node.name
        })
      }
    })
  }

  // Validate node-specific requirements
  workflow.nodes.forEach(node => {
    // HTTP Request validation
    if (node.type === 'n8n-nodes-base.httpRequest') {
      if (!node.parameters?.url) {
        result.isValid = false
        result.errors.push({
          type: 'error',
          message: `HTTP Request node "${node.name}" is missing URL parameter`,
          nodeId: node.id,
          nodeName: node.name
        })
      } else {
        try {
          new URL(node.parameters.url)
        } catch {
          result.isValid = false
          result.errors.push({
            type: 'error',
            message: `HTTP Request node "${node.name}" has invalid URL format`,
            nodeId: node.id,
            nodeName: node.name
          })
        }
      }
    }

    // Email Send validation
    if (node.type === 'n8n-nodes-base.emailSend') {
      if (!node.parameters?.to || !node.parameters?.subject) {
        result.warnings.push({
          type: 'warning',
          message: `Email node "${node.name}" is missing required parameters (to, subject)`,
          nodeId: node.id,
          nodeName: node.name
        })
      }

      // Validate email format - but be flexible for placeholders and expressions
      if (node.parameters?.to) {
        const emailValue = node.parameters.to.toString()
        // Skip validation for expressions (starting with {{), variables, or common placeholders
        const isExpression = emailValue.includes('{{') || emailValue.includes('${') || 
                            emailValue.includes('recipient@') || 
                            emailValue.includes('user@') ||
                            emailValue.includes('example.com') ||
                            emailValue.includes('.email') ||
                            emailValue === 'email'
        
        if (!isExpression && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          result.warnings.push({
            type: 'warning',
            message: `Email node "${node.name}" may have invalid email format. Use expressions or valid email addresses.`,
            nodeId: node.id,
            nodeName: node.name
          })
        }
      }
    }

    // Slack validation
    if (node.type === 'n8n-nodes-base.slack') {
      if (!node.parameters?.channel || !node.parameters?.text) {
        result.isValid = false
        result.errors.push({
          type: 'error',
          message: `Slack node "${node.name}" is missing required parameters (channel, text)`,
          nodeId: node.id,
          nodeName: node.name
        })
      }
    }

    // Function node validation
    if (node.type === 'n8n-nodes-base.function') {
      if (!node.parameters?.functionCode) {
        result.isValid = false
        result.errors.push({
          type: 'error',
          message: `Function node "${node.name}" is missing JavaScript code`,
          nodeId: node.id,
          nodeName: node.name
        })
      }
    }

    // Webhook validation
    if (node.type === 'n8n-nodes-base.webhook') {
      if (!node.parameters?.path) {
        result.isValid = false
        result.errors.push({
          type: 'error',
          message: `Webhook node "${node.name}" is missing path parameter`,
          nodeId: node.id,
          nodeName: node.name
        })
      }
    }

    // Check for disabled nodes in critical paths
    if (node.disabled && connectedNodeNames.has(node.name)) {
      result.warnings.push({
        type: 'warning',
        message: `Node "${node.name}" is disabled but still connected in the workflow`,
        nodeId: node.id,
        nodeName: node.name
      })
    }
  })

  // Check for circular dependencies (basic check)
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  const hasCycle = (nodeName: string): boolean => {
    if (recursionStack.has(nodeName)) return true
    if (visited.has(nodeName)) return false

    visited.add(nodeName)
    recursionStack.add(nodeName)

    const connections = nodeConnections.get(nodeName) || []
    for (const connectedNode of connections) {
      if (hasCycle(connectedNode)) return true
    }

    recursionStack.delete(nodeName)
    return false
  }

  for (const nodeName of Array.from(nodeConnections.keys())) {
    if (hasCycle(nodeName)) {
      result.warnings.push({
        type: 'warning',
        message: 'Potential circular dependency detected in workflow connections'
      })
      break
    }
  }

  return result
}

export default function WorkflowValidator({ 
  workflow, 
  onValidationResult, 
  showVisualFeedback = true 
}: WorkflowValidatorProps) {
  const validationResult = useMemo(() => validateWorkflow(workflow), [workflow])

  // Call callback with validation result using useEffect to prevent infinite re-renders
  useEffect(() => {
    if (onValidationResult) {
      onValidationResult(validationResult)
    }
  }, [validationResult, onValidationResult])

  if (!showVisualFeedback) return null

  const { isValid, errors, warnings } = validationResult

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>Workflow validation passed</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ready to Deploy
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <Alert key={`error-${index}`} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{error.message}</span>
              {error.nodeName && (
                <Badge variant="destructive" className="text-xs">
                  {error.nodeName}
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {warnings.map((warning, index) => (
        <Alert key={`warning-${index}`} className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <span>{warning.message}</span>
              {warning.nodeName && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  {warning.nodeName}
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}