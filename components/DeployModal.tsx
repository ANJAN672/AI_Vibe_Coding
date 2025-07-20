'use client'

import { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle, Eye, EyeOff, Shield, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { N8nWorkflow } from '@/store/workflowStore'
import WorkflowValidator, { validateWorkflow, ValidationResult } from './WorkflowValidator'

interface DeployModalProps {
  workflow: N8nWorkflow | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

interface DeploymentCredentials {
  hostUrl: string
  email: string
  password: string
}



export default function DeployModal({ workflow, isOpen, onClose, onSuccess, onError }: DeployModalProps) {
  const [credentials, setCredentials] = useState<DeploymentCredentials>({
    hostUrl: 'http://localhost:5678',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deploymentMessage, setDeploymentMessage] = useState('')
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  if (!isOpen || !workflow) return null

  // Handle validation result
  const handleValidationResult = (result: ValidationResult) => {
    setValidationResult(result)
  }

  const handleDeploy = async () => {
    // Validate form
    if (!credentials.hostUrl || !credentials.email || !credentials.password) {
      setDeploymentStatus('error')
      setDeploymentMessage('Please fill in all required fields')
      return
    }

    // Validate URL format
    try {
      new URL(credentials.hostUrl)
    } catch {
      setDeploymentStatus('error')
      setDeploymentMessage('Please enter a valid n8n host URL')
      return
    }

    // Validate workflow
    const validation = validateWorkflow(workflow)
    
    if (!validation.isValid) {
      setDeploymentStatus('error')
      setDeploymentMessage('Please fix the workflow validation errors before deploying')
      return
    }

    setIsDeploying(true)
    setDeploymentStatus('idle')
    setDeploymentMessage('')

    try {
      const response = await fetch('/api/deploy-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow,
          credentials: {
            hostUrl: credentials.hostUrl,
            email: credentials.email,
            password: credentials.password
          }
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setDeploymentStatus('success')
        setDeploymentResult(result)
        const successMessage = `Workflow "${workflow.name}" deployed successfully to n8n!`
        setDeploymentMessage(successMessage)
        
        // Call success callback
        if (onSuccess) {
          onSuccess(successMessage)
        }
        
        // Clear sensitive data
        setCredentials(prev => ({ ...prev, password: '' }))
        
        // Don't auto-close, let user manually close
      } else {
        setDeploymentStatus('error')
        const errorMessage = result.error || 'Failed to deploy workflow'
        setDeploymentMessage(errorMessage)
        
        // Call error callback
        if (onError) {
          onError(errorMessage)
        }
      }
    } catch (error) {
      setDeploymentStatus('error')
      const errorMessage = 'Network error: Unable to connect to deployment service'
      setDeploymentMessage(errorMessage)
      
      // Call error callback
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsDeploying(false)
    }
  }

  const handleClose = () => {
    // Clear sensitive data when closing
    setCredentials(prev => ({ ...prev, password: '' }))
    setDeploymentStatus('idle')
    setDeploymentMessage('')
    setDeploymentResult(null)
    setValidationResult(null)
    onClose()
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              deploymentStatus === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {deploymentStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <Upload className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {deploymentStatus === 'success' ? '🎉 Deployment Successful' : 'Deploy to n8n'}
              </h2>
              <p className="text-sm text-gray-500">
                {deploymentStatus === 'success' 
                  ? 'Your workflow is now live and ready to use' 
                  : 'Deploy your workflow to n8n instance'
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Workflow Info - Always show */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Workflow Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{workflow.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nodes:</span>
                <span className="font-medium">{workflow.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Connections:</span>
                <span className="font-medium">{Object.keys(workflow.connections || {}).length}</span>
              </div>
            </div>
          </div>

          {/* Show form only if not successful */}
          {deploymentStatus !== 'success' && (
            <>
              {/* Workflow Validation */}
              <WorkflowValidator 
                workflow={workflow}
                onValidationResult={handleValidationResult}
                showVisualFeedback={true}
              />

              {/* n8n Connection Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">n8n Instance</h3>
                </div>

                {/* Host URL */}
                <div className="space-y-2">
                  <Label htmlFor="host-url" className="text-sm font-medium">
                    n8n Host URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="host-url"
                    type="url"
                    value={credentials.hostUrl}
                    onChange={(e) => setCredentials(prev => ({ ...prev, hostUrl: e.target.value }))}
                    placeholder="http://localhost:5678"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Enter the full URL of your n8n instance (e.g., http://localhost:5678 or https://your-n8n.com)
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your-email@example.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Your n8n password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Security Notice:</strong> Your credentials are transmitted securely and never stored. 
                  They are only used to authenticate with your n8n instance for this deployment.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Deployment Status */}
          {deploymentStatus === 'success' && deploymentResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-900 mb-3">
                    🎉 Deployment Successful!
                  </h4>
                  <p className="text-green-800 mb-3 text-base leading-relaxed">
                    Your workflow <strong>"{workflow.name}"</strong> has been successfully deployed to n8n.
                  </p>
                  
                  <p className="text-sm text-green-600">
                    💡 Use the "Open in n8n" button below to access your workflow
                  </p>
                </div>
              </div>
            </div>
          )}

          {deploymentStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deploymentMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {deploymentStatus === 'success' ? (
            // Success state buttons
            <>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {deploymentResult?.n8nUrl && (
                <Button 
                  onClick={() => window.open(deploymentResult.n8nUrl, '_blank')}
                  className="flex-1"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Open in n8n
                </Button>
              )}
            </>
          ) : (
            // Default state buttons
            <>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying || (validationResult ? !validationResult.isValid : false)}
                className="flex-1"
              >
                {isDeploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Deploy Workflow
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}