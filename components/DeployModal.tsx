'use client'

import { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle, Eye, EyeOff, Shield, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  apiKey: string
}



export default function DeployModal({ workflow, isOpen, onClose, onSuccess, onError }: DeployModalProps) {
  const [credentials, setCredentials] = useState<DeploymentCredentials>({
    hostUrl: 'http://localhost:5678',
    apiKey: ''
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
    if (!credentials.hostUrl) {
      setDeploymentStatus('error')
      setDeploymentMessage('Please enter the n8n host URL')
      return
    }

    if (!credentials.apiKey) {
      setDeploymentStatus('error')
      setDeploymentMessage('Please enter your n8n API key')
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
            apiKey: credentials.apiKey
          }
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setDeploymentStatus('success')
        setDeploymentResult(result)
        
        // Create appropriate success message based on accessibility
        let successMessage = `Workflow "${workflow.name}" deployed successfully to n8n!`
        if (result.warning) {
          successMessage += ` Note: ${result.warning}`
        }
        
        setDeploymentMessage(successMessage)
        
        // Call success callback
        if (onSuccess) {
          onSuccess(successMessage)
        }
        
        // Clear sensitive data
        setCredentials(prev => ({ 
          ...prev, 
          apiKey: ''
        }))
        
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
    setCredentials(prev => ({ ...prev, apiKey: '' }))
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
      <div className="relative w-full max-w-md sm:max-w-lg bg-card border border-border rounded-lg shadow-xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
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
            <div className="text-left">
              <h2 className="text-xl font-bold text-foreground text-left">
                {deploymentStatus === 'success' ? '🎉 Deployment Successful' : 'Deploy Workflow to n8n'}
              </h2>
              <p className="text-sm text-muted-foreground text-left">
                {deploymentStatus === 'success' 
                  ? 'Your workflow is now live and ready to use' 
                  : 'Deploy your workflow to n8n instance'
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Workflow Info - Always show */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Workflow Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{workflow.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes:</span>
                <span className="font-medium text-foreground">{workflow.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections:</span>
                <span className="font-medium text-foreground">{Object.keys(workflow.connections || {}).length}</span>
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
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">n8n Instance</h3>
                </div>

                {/* Host URL */}
                <div className="space-y-2">
                  <Label htmlFor="host-url" className="text-sm font-medium text-foreground">
                    n8n Host URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="host-url"
                    type="url"
                    value={credentials.hostUrl}
                    onChange={(e) => setCredentials(prev => ({ ...prev, hostUrl: e.target.value }))}
                    placeholder="http://localhost:5678"
                    className="font-mono text-sm bg-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full URL of your n8n instance (e.g., http://localhost:5678 or https://your-n8n.com)
                  </p>
                </div>

                {/* n8n API Key */}
                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-sm font-medium text-foreground">
                    n8n API Key <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="font-mono text-sm bg-background border-border text-foreground"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create an API key in n8n: Settings → n8n API → Create API Key
                  </p>
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
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-green-900 dark:text-green-100 text-center">
                    🎉 Deployment Successful
                  </h4>
                  
                  <div className="text-center">
                    <p className="text-green-800 dark:text-green-200 text-base leading-relaxed max-w-md mx-auto break-words">
                      Workflow <strong className="font-semibold">"{workflow.name}"</strong> deployed successfully to n8n!
                    </p>
                  </div>
                  
                  <div className="pt-2 text-center">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      💡 Click "Open in n8n" below to access your workflow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deploymentStatus === 'error' && (
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {deploymentMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          {deploymentStatus === 'success' ? (
            // Success state buttons
            <div className="space-y-3">
              {deploymentResult?.n8nUrl && deploymentResult.n8nUrl.indexOf('undefined') === -1 && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      console.log('Opening n8n URL:', deploymentResult.n8nUrl)
                      window.open(deploymentResult.n8nUrl, '_blank')
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5"
                    size="lg"
                  >
                    <Server className="h-5 w-5 mr-2" />
                    {deploymentResult.accessible === false ? 'View Workflows in n8n' : 'Open in n8n'}
                  </Button>
                  
                  {deploymentResult.accessible === false && deploymentResult.fallbackUrl && (
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                        ⚠️ Direct workflow access may not work. Try the workflows list instead.
                      </p>
                      <Button 
                        onClick={() => {
                          console.log('Opening n8n workflows list:', deploymentResult.fallbackUrl)
                          window.open(deploymentResult.fallbackUrl, '_blank')
                        }}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Server className="h-4 w-4 mr-2" />
                        Open Workflows List
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {(!deploymentResult?.n8nUrl || deploymentResult.n8nUrl.indexOf('undefined') !== -1) && (
                <div className="text-sm text-amber-600 dark:text-amber-400 text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                  ⚠️ Workflow deployed successfully, but the n8n URL is not available. Please check your n8n instance manually.
                </div>
              )}
              <Button variant="outline" onClick={handleClose} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          ) : (
            // Default state buttons
            <div className="flex gap-3">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}