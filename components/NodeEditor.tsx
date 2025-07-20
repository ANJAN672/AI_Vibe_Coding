'use client'

import { useState, useEffect } from 'react'
import { X, Save, Settings, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { N8nNode } from '@/store/workflowStore'

interface NodeEditorProps {
  node: N8nNode | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedNode: N8nNode) => void
}

// Node type configurations based on n8n patterns
const NODE_CONFIGURATIONS = {
  'n8n-nodes-base.start': {
    displayName: 'Start',
    description: 'Trigger node to start the workflow',
    icon: '▶️',
    color: '#16a34a',
    fields: []
  },
  'n8n-nodes-base.httpRequest': {
    displayName: 'HTTP Request',
    description: 'Make HTTP requests to any URL',
    icon: '🌐',
    color: '#3b82f6',
    fields: [
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
      { name: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/data', required: true },
      { name: 'headers', label: 'Headers', type: 'json', placeholder: '{"Content-Type": "application/json"}' },
      { name: 'body', label: 'Body', type: 'json', placeholder: '{"key": "value"}' },
      { name: 'timeout', label: 'Timeout (ms)', type: 'number', default: 10000 }
    ]
  },
  'n8n-nodes-base.set': {
    displayName: 'Edit Fields (Set)',
    description: 'Set values for data fields',
    icon: '⚙️',
    color: '#0284c7',
    fields: [
      { name: 'values', label: 'Values to Set', type: 'json', placeholder: '{"field1": "value1", "field2": "value2"}', required: true },
      { name: 'keepOnlySet', label: 'Keep Only Set Fields', type: 'boolean', default: false }
    ]
  },
  'n8n-nodes-base.function': {
    displayName: 'Function',
    description: 'Execute custom JavaScript code',
    icon: '🔧',
    color: '#0ea5e9',
    fields: [
      { name: 'functionCode', label: 'JavaScript Code', type: 'code', placeholder: 'return items.map(item => {\n  // Your code here\n  return item;\n});', required: true }
    ]
  },
  'n8n-nodes-base.if': {
    displayName: 'IF',
    description: 'Conditional logic node',
    icon: '❓',
    color: '#8b5cf6',
    fields: [
      { name: 'conditions', label: 'Conditions', type: 'json', placeholder: '{"field": "value", "operation": "equal"}', required: true },
      { name: 'combineOperation', label: 'Combine', type: 'select', options: ['AND', 'OR'], default: 'AND' }
    ]
  },
  'n8n-nodes-base.slack': {
    displayName: 'Slack',
    description: 'Send messages to Slack',
    icon: '💬',
    color: '#f59e0b',
    fields: [
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
      { name: 'text', label: 'Message Text', type: 'textarea', placeholder: 'Hello from n8n!', required: true },
      { name: 'username', label: 'Username', type: 'text', placeholder: 'n8n-bot' },
      { name: 'emoji', label: 'Emoji', type: 'text', placeholder: ':robot_face:' }
    ]
  },
  'n8n-nodes-base.emailSend': {
    displayName: 'Send Email',
    description: 'Send emails via SMTP',
    icon: '📤',
    color: '#f97316',
    fields: [
      { name: 'to', label: 'To Email', type: 'text', placeholder: 'recipient@example.com', required: true },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email Subject', required: true },
      { name: 'text', label: 'Email Text', type: 'textarea', placeholder: 'Email content...', required: true },
      { name: 'from', label: 'From Email', type: 'text', placeholder: 'sender@example.com' },
      { name: 'html', label: 'HTML Content', type: 'textarea', placeholder: '<h1>HTML Email</h1>' }
    ]
  },
  'n8n-nodes-base.webhook': {
    displayName: 'Webhook',
    description: 'Receive HTTP requests',
    icon: '🔗',
    color: '#059669',
    fields: [
      { name: 'httpMethod', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
      { name: 'path', label: 'Path', type: 'text', placeholder: 'webhook-path', required: true },
      { name: 'responseMode', label: 'Response Mode', type: 'select', options: ['onReceived', 'lastNode'], default: 'onReceived' }
    ]
  }
}

export default function NodeEditor({ node, isOpen, onClose, onSave }: NodeEditorProps) {
  const [editedNode, setEditedNode] = useState<N8nNode | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (node) {
      setEditedNode({ ...node })
      setErrors({})
    }
  }, [node])

  if (!isOpen || !editedNode) return null

  const nodeConfig = NODE_CONFIGURATIONS[editedNode.type as keyof typeof NODE_CONFIGURATIONS] || {
    displayName: 'Unknown Node',
    description: 'Unknown node type',
    icon: '⚡',
    color: '#64748b',
    fields: []
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditedNode(prev => {
      if (!prev) return null
      
      const updatedParameters = { ...prev.parameters }
      
      if (fieldName === 'name') {
        return { ...prev, name: value }
      } else if (fieldName === 'notes') {
        return { ...prev, notes: value }
      } else if (fieldName === 'disabled') {
        return { ...prev, disabled: value }
      } else {
        updatedParameters[fieldName] = value
        return { ...prev, parameters: updatedParameters }
      }
    })

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate node name
    if (!editedNode.name?.trim()) {
      newErrors.name = 'Node name is required'
    }

    // Validate required fields
    nodeConfig.fields.forEach(field => {
      if (field.required) {
        const value = editedNode.parameters?.[field.name]
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.name] = `${field.label} is required`
        }
      }

      // Validate JSON fields
      if (field.type === 'json' && editedNode.parameters?.[field.name]) {
        try {
          JSON.parse(editedNode.parameters[field.name])
        } catch {
          newErrors[field.name] = 'Invalid JSON format'
        }
      }

      // Validate URL fields
      if (field.name === 'url' && editedNode.parameters?.[field.name]) {
        try {
          new URL(editedNode.parameters[field.name])
        } catch {
          newErrors[field.name] = 'Invalid URL format'
        }
      }

      // Validate email fields
      if (field.name.includes('email') || field.name === 'to' || field.name === 'from') {
        const emailValue = editedNode.parameters?.[field.name]
        if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          newErrors[field.name] = 'Invalid email format'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!editedNode || !validateForm()) return

    onSave(editedNode)
    onClose()
  }

  const renderField = (field: any) => {
    const value = field.name === 'name' ? editedNode.name : 
                  field.name === 'notes' ? editedNode.notes :
                  field.name === 'disabled' ? editedNode.disabled :
                  editedNode.parameters?.[field.name] || field.default || ''

    const hasError = errors[field.name]

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'code':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={8}
              className={`font-mono text-sm ${hasError ? 'border-red-500' : ''}`}
            />
            {hasError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'json':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`font-mono text-sm ${hasError ? 'border-red-500' : ''}`}
            />
            {hasError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || 0)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'boolean':
        return (
          <div key={field.name} className="flex items-center justify-between py-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </Label>
            <Switch
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md bg-white shadow-xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: nodeConfig.color }}
            >
              {nodeConfig.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{nodeConfig.displayName}</h2>
              <p className="text-sm text-gray-500">{nodeConfig.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Basic Settings</h3>
            </div>
            
            {/* Node Name */}
            <div className="space-y-2">
              <Label htmlFor="node-name" className="text-sm font-medium">
                Node Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="node-name"
                value={editedNode.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Enter node name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Node Notes */}
            <div className="space-y-2">
              <Label htmlFor="node-notes" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="node-notes"
                value={editedNode.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Add notes about this node..."
                rows={2}
              />
            </div>

            {/* Disabled Toggle */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="node-disabled" className="text-sm font-medium">Disabled</Label>
              <Switch
                id="node-disabled"
                checked={Boolean(editedNode.disabled)}
                onCheckedChange={(checked) => handleFieldChange('disabled', checked)}
              />
            </div>
          </div>

          {/* Node-specific Parameters */}
          {nodeConfig.fields.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Parameters</h3>
                </div>
                {nodeConfig.fields.map(renderField)}
              </div>
            </>
          )}

          {/* Node Type Badge */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Node Type</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {editedNode.type}
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}