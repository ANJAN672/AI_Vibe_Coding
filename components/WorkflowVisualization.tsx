'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { 
  ReactFlow,
  ReactFlowProvider, 
  Background, 
  Node, 
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  MiniMap,
  Panel,
  Handle,
  Position,
  ConnectionMode
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflowStore, N8nNode } from '@/store/workflowStore'
import NodeEditor from './NodeEditor'
import WorkflowValidator, { ValidationResult } from './WorkflowValidator'

// Custom node component with enhanced styling and information
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  const getNodeColor = (type: string, disabled: boolean, hasError?: boolean, hasWarning?: boolean, isDisconnected?: boolean) => {
    if (hasError) return { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' }
    if (isDisconnected) return { bg: '#fff7ed', border: '#f97316', text: '#c2410c' }
    if (hasWarning) return { bg: '#fefce8', border: '#eab308', text: '#a16207' }
    if (disabled) return { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' }
    
    const typeColors: Record<string, { bg: string; border: string; text: string }> = {
      // TRIGGER NODES - Green shades
      'n8n-nodes-base.start': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
      'n8n-nodes-base.webhook': { bg: '#d1fae5', border: '#059669', text: '#047857' },
      'n8n-nodes-base.cron': { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
      'n8n-nodes-base.emailTrigger': { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
      'n8n-nodes-base.manualTrigger': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
      
      // DATA PROCESSING - Blue shades
      'n8n-nodes-base.httpRequest': { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
      'n8n-nodes-base.set': { bg: '#e0f2fe', border: '#0284c7', text: '#0c4a6e' },
      'n8n-nodes-base.function': { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1' },
      'n8n-nodes-base.functionItem': { bg: '#e0f2fe', border: '#0284c7', text: '#0c4a6e' },
      'n8n-nodes-base.merge': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      'n8n-nodes-base.split': { bg: '#bfdbfe', border: '#2563eb', text: '#1d4ed8' },
      'n8n-nodes-base.aggregate': { bg: '#93c5fd', border: '#1d4ed8', text: '#1e3a8a' },
      'n8n-nodes-base.sort': { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
      'n8n-nodes-base.limit': { bg: '#e0f2fe', border: '#0284c7', text: '#0c4a6e' },
      
      // LOGIC & FLOW - Purple shades
      'n8n-nodes-base.if': { bg: '#f3e8ff', border: '#8b5cf6', text: '#7c3aed' },
      'n8n-nodes-base.switch': { bg: '#ede9fe', border: '#7c3aed', text: '#6b21a8' },
      'n8n-nodes-base.wait': { bg: '#e9d5ff', border: '#9333ea', text: '#7e22ce' },
      'n8n-nodes-base.stopAndError': { bg: '#fce7f3', border: '#ec4899', text: '#be185d' },
      
      // COMMUNICATION - Orange/Yellow shades
      'n8n-nodes-base.slack': { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
      'n8n-nodes-base.discord': { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
      'n8n-nodes-base.telegram': { bg: '#fed7aa', border: '#ea580c', text: '#c2410c' },
      'n8n-nodes-base.emailSend': { bg: '#ffedd5', border: '#f97316', text: '#ea580c' },
      'n8n-nodes-base.sms': { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
      
      // CLOUD SERVICES - Cyan/Teal shades
      'n8n-nodes-base.googleDrive': { bg: '#cffafe', border: '#06b6d4', text: '#0e7490' },
      'n8n-nodes-base.googleSheets': { bg: '#e6fffa', border: '#14b8a6', text: '#0f766e' },
      'n8n-nodes-base.googleCalendar': { bg: '#f0fdfa', border: '#0d9488', text: '#134e4a' },
      'n8n-nodes-base.dropbox': { bg: '#cffafe', border: '#06b6d4', text: '#0e7490' },
      'n8n-nodes-base.s3': { bg: '#e6fffa', border: '#14b8a6', text: '#0f766e' },
      
      // DATABASES - Red/Pink shades
      'n8n-nodes-base.mysql': { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' },
      'n8n-nodes-base.postgres': { bg: '#fecaca', border: '#f87171', text: '#b91c1c' },
      'n8n-nodes-base.mongodb': { bg: '#fed7d7', border: '#f56565', text: '#e53e3e' },
      'n8n-nodes-base.redis': { bg: '#ffe4e6', border: '#fb7185', text: '#e11d48' },
      'n8n-nodes-base.airtable': { bg: '#fce7f3', border: '#ec4899', text: '#be185d' },
      
      // DEVELOPMENT - Indigo shades
      'n8n-nodes-base.github': { bg: '#e0e7ff', border: '#6366f1', text: '#4f46e5' },
      'n8n-nodes-base.gitlab': { bg: '#eef2ff', border: '#818cf8', text: '#6366f1' },
      'n8n-nodes-base.jira': { bg: '#e0e7ff', border: '#6366f1', text: '#4f46e5' },
      
      // CRM & BUSINESS - Emerald/Lime shades
      'n8n-nodes-base.hubspot': { bg: '#d1fae5', border: '#059669', text: '#047857' },
      'n8n-nodes-base.salesforce': { bg: '#ecfccb', border: '#65a30d', text: '#4d7c0f' },
      'n8n-nodes-base.notion': { bg: '#f7fee7', border: '#84cc16', text: '#65a30d' },
      'n8n-nodes-base.trello': { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    }
    
    return typeColors[type] || { bg: '#f8fafc', border: '#64748b', text: '#334155' }
  }

  const nodeTypeName = data.type.split('.').pop() || 'Unknown'
  
  // Get node category icon
  const getNodeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      // TRIGGER NODES
      'n8n-nodes-base.start': '▶️',
      'n8n-nodes-base.webhook': '🔗',
      'n8n-nodes-base.cron': '⏰',
      'n8n-nodes-base.emailTrigger': '📧',
      'n8n-nodes-base.manualTrigger': '👆',
      
      // DATA PROCESSING
      'n8n-nodes-base.httpRequest': '🌐',
      'n8n-nodes-base.set': '⚙️',
      'n8n-nodes-base.function': '🔧',
      'n8n-nodes-base.functionItem': '🔧',
      'n8n-nodes-base.merge': '🔀',
      'n8n-nodes-base.split': '✂️',
      'n8n-nodes-base.aggregate': '📊',
      'n8n-nodes-base.sort': '🔢',
      'n8n-nodes-base.limit': '🚫',
      
      // LOGIC & FLOW
      'n8n-nodes-base.if': '❓',
      'n8n-nodes-base.switch': '🔀',
      'n8n-nodes-base.wait': '⏳',
      'n8n-nodes-base.stopAndError': '🛑',
      
      // COMMUNICATION
      'n8n-nodes-base.slack': '💬',
      'n8n-nodes-base.discord': '🎮',
      'n8n-nodes-base.telegram': '📱',
      'n8n-nodes-base.emailSend': '📤',
      'n8n-nodes-base.sms': '📲',
      
      // CLOUD SERVICES
      'n8n-nodes-base.googleDrive': '☁️',
      'n8n-nodes-base.googleSheets': '📊',
      'n8n-nodes-base.googleCalendar': '📅',
      'n8n-nodes-base.dropbox': '📦',
      'n8n-nodes-base.s3': '🪣',
      
      // DATABASES
      'n8n-nodes-base.mysql': '🗄️',
      'n8n-nodes-base.postgres': '🐘',
      'n8n-nodes-base.mongodb': '🍃',
      'n8n-nodes-base.redis': '🔴',
      'n8n-nodes-base.airtable': '📋',
      
      // DEVELOPMENT
      'n8n-nodes-base.github': '🐙',
      'n8n-nodes-base.gitlab': '🦊',
      'n8n-nodes-base.jira': '🎫',
      
      // CRM & BUSINESS
      'n8n-nodes-base.hubspot': '🎯',
      'n8n-nodes-base.salesforce': '☁️',
      'n8n-nodes-base.notion': '📝',
      'n8n-nodes-base.trello': '📋',
    }
    return iconMap[type] || '⚡'
  }
  
  const nodeIcon = getNodeIcon(data.type)
  const nodeColors = getNodeColor(data.type, data.disabled, data.hasValidationError, data.hasValidationWarning, data.isDisconnected)

  return (
    <>
      {/* Input Handle - Left side */}
      {data.type !== 'n8n-nodes-base.start' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#10b981',
            border: '3px solid #ffffff',
            width: '18px',
            height: '18px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            borderRadius: '50%',
            left: '-9px',
            zIndex: 10,
          }}
          className="hover:scale-125 hover:shadow-lg transition-all duration-200"
        />
      )}
      
      {/* Output Handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#3b82f6',
          border: '3px solid #ffffff',
          width: '18px',
          height: '18px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          borderRadius: '50%',
          right: '-9px',
          zIndex: 10,
        }}
        className="hover:scale-125 hover:shadow-lg transition-all duration-200"
      />
      
      <div 
        className={`relative px-4 py-3 border-2 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer ${
          selected ? 'shadow-xl ring-2 ring-blue-400 ring-opacity-50' : 'shadow-md'
        } ${data.disabled ? 'opacity-60' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${nodeColors.bg} 0%, ${nodeColors.bg}f0 100%)`,
          borderColor: nodeColors.border,
          color: nodeColors.text,
          minWidth: '200px',
          maxWidth: '280px',
          boxShadow: selected 
            ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
        onDoubleClick={() => {
          // Trigger edit mode
          if (data.onEdit) {
            data.onEdit(data.nodeData)
          } else {
            setShowDetails(!showDetails)
          }
        }}
      >
      {/* Status indicators and Edit button */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {/* Edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (data.onEdit) {
              data.onEdit(data.nodeData)
            }
          }}
          className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-lg"
          title="Edit Node"
        >
          ✏️
        </button>
        
        {data.disabled && (
          <span className="w-3 h-3 bg-gray-400 rounded-full" title="Disabled" />
        )}
        {data.continueOnFail && (
          <span className="w-3 h-3 bg-yellow-400 rounded-full" title="Continue on Fail" />
        )}
        {data.retryOnFail && (
          <span className="w-3 h-3 bg-orange-400 rounded-full" title="Retry on Fail" />
        )}
      </div>

      {/* Main content */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{nodeIcon}</span>
        <div className="flex-1">
          <div className="font-medium text-sm break-words">{data.label}</div>
          <div className="text-xs opacity-75">{nodeTypeName}</div>
        </div>
      </div>
      
      {/* Additional info when expanded */}
      {showDetails && (
        <div className="text-xs space-y-1 mt-2 pt-2 border-t border-current opacity-60">
          {data.notes && (
            <div className="break-words">
              <strong>Notes:</strong> {data.notes}
            </div>
          )}
          {data.credentials && Object.keys(data.credentials).length > 0 && (
            <div>
              <strong>Credentials:</strong> {Object.keys(data.credentials).join(', ')}
            </div>
          )}
          {data.maxTries && (
            <div>
              <strong>Max Tries:</strong> {data.maxTries}
            </div>
          )}
        </div>
      )}
      
      {/* Hover tooltip for notes */}
      {data.notes && !showDetails && (
        <div className="text-xs opacity-60 mt-1 truncate" title={data.notes}>
          📝 {data.notes}
        </div>
      )}
      </div>
    </>
  )
}

// Component that uses React Flow hooks - must be inside ReactFlow
const FlowControls = () => {
  const { fitView, getNodes, setNodes } = useReactFlow()
  const [showMiniMap, setShowMiniMap] = useState(true)
  
  // Auto-arrange nodes in a better layout
  const autoArrangeNodes = useCallback(() => {
    const nodes = getNodes()
    const arrangedNodes = nodes.map((node, index) => {
      const totalNodes = nodes.length
      let newPosition = { x: 0, y: 0 }
      
      if (totalNodes <= 6) {
        // Linear horizontal layout
        newPosition = {
          x: index * 350 + 100,
          y: 300
        }
      } else {
        // Grid layout
        const columns = Math.min(4, Math.ceil(totalNodes / 3))
        const row = Math.floor(index / columns)
        const col = index % columns
        const offsetX = (columns - 1) * 350 / 2
        
        newPosition = {
          x: col * 350 - offsetX + 100,
          y: row * 250 + 200
        }
      }
      
      return {
        ...node,
        position: newPosition
      }
    })
    
    setNodes(arrangedNodes)
    setTimeout(() => fitView({ padding: 100, duration: 800 }), 100)
  }, [getNodes, setNodes, fitView])
  
  return (
    <>
      <Panel position="top-right" className="flow-controls-panel p-3">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className="flow-control-button primary text-xs px-3 py-2 rounded-md font-medium"
          >
            {showMiniMap ? 'Hide' : 'Show'} Minimap
          </button>
          <button
            onClick={autoArrangeNodes}
            className="flow-control-button success text-xs px-3 py-2 rounded-md font-medium"
            title="Auto Arrange Workflow"
          >
            Auto Arrange
          </button>
        </div>
      </Panel>
      
      {showMiniMap && (
        <MiniMap
          nodeColor={(node) => {
            const colors = {
              // TRIGGER NODES - Green shades
              'n8n-nodes-base.start': '#16a34a',
              'n8n-nodes-base.webhook': '#059669',
              'n8n-nodes-base.cron': '#10b981',
              'n8n-nodes-base.emailTrigger': '#22c55e',
              'n8n-nodes-base.manualTrigger': '#16a34a',
              
              // DATA PROCESSING - Blue shades
              'n8n-nodes-base.httpRequest': '#3b82f6',
              'n8n-nodes-base.set': '#0284c7',
              'n8n-nodes-base.function': '#0ea5e9',
              'n8n-nodes-base.functionItem': '#0284c7',
              'n8n-nodes-base.merge': '#3b82f6',
              'n8n-nodes-base.split': '#2563eb',
              'n8n-nodes-base.aggregate': '#1d4ed8',
              'n8n-nodes-base.sort': '#3b82f6',
              'n8n-nodes-base.limit': '#0284c7',
              
              // LOGIC & FLOW - Purple shades
              'n8n-nodes-base.if': '#8b5cf6',
              'n8n-nodes-base.switch': '#7c3aed',
              'n8n-nodes-base.wait': '#9333ea',
              'n8n-nodes-base.stopAndError': '#ec4899',
              
              // COMMUNICATION - Orange/Yellow shades
              'n8n-nodes-base.slack': '#f59e0b',
              'n8n-nodes-base.discord': '#f59e0b',
              'n8n-nodes-base.telegram': '#ea580c',
              'n8n-nodes-base.emailSend': '#f97316',
              'n8n-nodes-base.sms': '#f59e0b',
              
              // CLOUD SERVICES - Cyan/Teal shades
              'n8n-nodes-base.googleDrive': '#06b6d4',
              'n8n-nodes-base.googleSheets': '#14b8a6',
              'n8n-nodes-base.googleCalendar': '#0d9488',
              'n8n-nodes-base.dropbox': '#06b6d4',
              'n8n-nodes-base.s3': '#14b8a6',
              
              // DATABASES - Red/Pink shades
              'n8n-nodes-base.mysql': '#ef4444',
              'n8n-nodes-base.postgres': '#f87171',
              'n8n-nodes-base.mongodb': '#f56565',
              'n8n-nodes-base.redis': '#fb7185',
              'n8n-nodes-base.airtable': '#ec4899',
              
              // DEVELOPMENT - Indigo shades
              'n8n-nodes-base.github': '#6366f1',
              'n8n-nodes-base.gitlab': '#818cf8',
              'n8n-nodes-base.jira': '#6366f1',
              
              // CRM & BUSINESS - Emerald/Lime shades
              'n8n-nodes-base.hubspot': '#059669',
              'n8n-nodes-base.salesforce': '#65a30d',
              'n8n-nodes-base.notion': '#84cc16',
              'n8n-nodes-base.trello': '#10b981',
            }
            return colors[node.data?.type as keyof typeof colors] || '#64748b'
          }}
          nodeStrokeWidth={2}
          pannable
          zoomable
          position="bottom-right"
          className="react-flow__minimap"
        />
      )}
    </>
  )
}

function WorkflowVisualizationInner() {
  const { workflow, setWorkflow } = useWorkflowStore()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<N8nNode | null>(null)
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const reactFlowInstance = useReactFlow()

  // Spacebar + scroll zoom functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        const target = event.target as HTMLElement
        // Only prevent default if not in an input field
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.contentEditable) {
          setIsSpacePressed(true)
          event.preventDefault()
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (isSpacePressed) {
        event.preventDefault()
        event.stopPropagation()
        
        const zoomIn = event.deltaY < 0
        const zoomFactor = zoomIn ? 1.15 : 0.85
        const currentZoom = reactFlowInstance.getZoom()
        const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.1), 4)
        
        reactFlowInstance.zoomTo(newZoom, { duration: 100 })
      }
    }

    // Add event listeners to window for global capture
    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('wheel', handleWheel, true)
    }
  }, [isSpacePressed, reactFlowInstance])

  // Validation handler
  const handleValidationResult = useCallback((result: ValidationResult) => {
    setValidationResult(result)
  }, [])

  // Spacebar + scroll zoom functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle spacebar if we're not in an input/textarea/contenteditable element
      const target = event.target as HTMLElement
      const isInputElement = target?.tagName === 'INPUT' || 
                            target?.tagName === 'TEXTAREA' || 
                            target?.contentEditable === 'true'
      
      if (event.code === 'Space' && !event.repeat && !isInputElement) {
        event.preventDefault()
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInputElement = target?.tagName === 'INPUT' || 
                            target?.tagName === 'TEXTAREA' || 
                            target?.contentEditable === 'true'
                            
      if (event.code === 'Space' && !isInputElement) {
        event.preventDefault()
        setIsSpacePressed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Enhanced custom wheel handler for spacebar + scroll zoom
  const handleWheel = useCallback((event: Event) => {
    const wheelEvent = event as WheelEvent
    if (isSpacePressed) {
      wheelEvent.preventDefault()
      wheelEvent.stopPropagation()
      
      const currentZoom = reactFlowInstance.getZoom()
      const zoomIn = wheelEvent.deltaY < 0
      
      // Use more granular zoom factors for smoother experience
      const zoomFactor = zoomIn ? 1.05 : 0.95
      const newZoom = currentZoom * zoomFactor
      
      // Respect zoom limits
      const minZoom = 0.2
      const maxZoom = 2
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
      
      reactFlowInstance.zoomTo(clampedZoom, {
        duration: 150
      })
    }
  }, [isSpacePressed, reactFlowInstance])

  // Add wheel event listener to the ReactFlow container
  useEffect(() => {
    const reactFlowWrapper = document.querySelector('.react-flow')
    if (reactFlowWrapper) {
      reactFlowWrapper.addEventListener('wheel', handleWheel, { passive: false })
      
      return () => {
        reactFlowWrapper.removeEventListener('wheel', handleWheel)
      }
    }
    return undefined
  }, [handleWheel])

  // Node edit handlers
  const handleEditNode = useCallback((nodeData: N8nNode) => {
    setEditingNode(nodeData)
    setIsNodeEditorOpen(true)
  }, [])

  const handleSaveNode = useCallback((updatedNode: N8nNode) => {
    if (!workflow) return

    const updatedWorkflow = { ...workflow }
    const nodeIndex = updatedWorkflow.nodes.findIndex(n => n.id === updatedNode.id)
    
    if (nodeIndex !== -1) {
      // Update the node in the workflow
      updatedWorkflow.nodes[nodeIndex] = updatedNode
      
      // Update connections if node name changed
      const oldNode = workflow.nodes[nodeIndex]
      const oldName = oldNode?.name
      if (oldName && oldName !== updatedNode.name) {
        // Update connections where this node is the source
        if (updatedWorkflow.connections[oldName]) {
          updatedWorkflow.connections[updatedNode.name] = updatedWorkflow.connections[oldName]
          delete updatedWorkflow.connections[oldName]
        }
        
        // Update connections where this node is the target
        Object.keys(updatedWorkflow.connections).forEach(sourceName => {
          const sourceConnections = updatedWorkflow.connections[sourceName]
          if (sourceConnections) {
            Object.keys(sourceConnections).forEach(outputType => {
              const outputConnections = sourceConnections[outputType]
              if (outputConnections) {
                outputConnections.forEach(connectionArray => {
                  connectionArray.forEach(connection => {
                    if (connection.node === oldName) {
                      connection.node = updatedNode.name
                    }
                  })
                })
              }
            })
          }
        })
      }
      
      setWorkflow(updatedWorkflow)
    }
  }, [workflow, setWorkflow])

  // Define custom node types
  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), [])

  // Enhanced conversion with error handling and layout optimization
  const convertToReactFlow = useMemo(() => {
    if (!workflow) return { nodes: [], edges: [] }

    setIsLoading(true)
    setError(null)

    try {
      // Validate workflow structure
      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error('Invalid workflow structure: nodes must be an array')
      }

      if (!workflow.connections || typeof workflow.connections !== 'object') {
        throw new Error('Invalid workflow structure: connections must be an object')
      }

      // Enhanced auto-layout algorithm for better edge visibility
      const getNodePosition = (index: number, totalNodes: number): [number, number] => {
        // Use horizontal layout for better flow visualization
        if (totalNodes <= 5) {
          // Linear horizontal layout for small workflows
          const spacing = 400 // Increased spacing for better edge visibility
          return [index * spacing + 150, 300]
        } else if (totalNodes <= 10) {
          // Two-row layout for medium workflows
          const nodesPerRow = Math.ceil(totalNodes / 2)
          const row = Math.floor(index / nodesPerRow)
          const col = index % nodesPerRow
          const horizontalSpacing = 380
          const verticalSpacing = 300
          const offsetX = (nodesPerRow - 1) * horizontalSpacing / 2

          return [col * horizontalSpacing - offsetX + 200, row * verticalSpacing + 200]
        } else {
          // Grid layout for larger workflows with more spacing
          const columns = Math.min(4, Math.ceil(Math.sqrt(totalNodes))) // Dynamic columns based on total nodes
          const row = Math.floor(index / columns)
          const col = index % columns
          const horizontalSpacing = 380 // Increased horizontal spacing
          const verticalSpacing = 280   // Increased vertical spacing
          const offsetX = (columns - 1) * horizontalSpacing / 2

          return [col * horizontalSpacing - offsetX + 200, row * verticalSpacing + 150]
        }
      }

      const reactFlowNodes: Node[] = workflow.nodes.map((n8nNode, index) => {
        // Use provided position or calculate auto-layout position
        const position = n8nNode.position && n8nNode.position.length === 2 && 
          n8nNode.position[0] !== undefined && n8nNode.position[1] !== undefined
          ? { x: n8nNode.position[0], y: n8nNode.position[1] }
          : { x: getNodePosition(index, workflow.nodes.length)[0], y: getNodePosition(index, workflow.nodes.length)[1] }

        return {
          id: n8nNode.id || `node-${index}`,
          position,
          data: { 
            label: n8nNode.name || `Node ${index + 1}`,
            type: n8nNode.type || 'unknown',
            parameters: n8nNode.parameters || {},
            disabled: Boolean(n8nNode.disabled),
            notes: n8nNode.notes || '',
            credentials: n8nNode.credentials || {},
            continueOnFail: Boolean(n8nNode.continueOnFail),
            retryOnFail: Boolean(n8nNode.retryOnFail),
            maxTries: n8nNode.maxTries || 1,
            waitBetweenTries: n8nNode.waitBetweenTries || 0,
            nodeData: n8nNode, // Pass the full node data for editing
            onEdit: handleEditNode, // Pass the edit handler
            hasValidationError: validationResult?.errors.some(e => e.nodeId === n8nNode.id) || false,
            hasValidationWarning: validationResult?.warnings.some(w => w.nodeId === n8nNode.id) || false,
            isDisconnected: validationResult?.disconnectedNodes.includes(n8nNode.id) || false
          },
          type: 'custom',
          draggable: true,
          selectable: true,
        }
      })

      const reactFlowEdges: Edge[] = []
      
      // ALWAYS CREATE SEQUENTIAL CONNECTIONS - This ensures every workflow is fully connected
      if (reactFlowNodes.length > 1) {
        // Create sequential connections between all nodes
        for (let i = 0; i < reactFlowNodes.length - 1; i++) {
          const sourceNode = reactFlowNodes[i]
          const targetNode = reactFlowNodes[i + 1]
          
          if (sourceNode && targetNode) {
            reactFlowEdges.push({
              id: `auto-${sourceNode.id}-${targetNode.id}`,
              source: sourceNode.id,
              target: targetNode.id,
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: '#4f46e5',
                strokeWidth: 2,
                opacity: 0.8,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#4f46e5',
                width: 10,
                height: 10,
              },
            })
          }
        }
      }

      setIsLoading(false)
      return { nodes: reactFlowNodes, edges: reactFlowEdges }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert workflow')
      setIsLoading(false)
      return { nodes: [], edges: [] }
    }
  }, [workflow])

  // Update nodes and edges when workflow changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = convertToReactFlow
    setNodes(newNodes)
    setEdges(newEdges)
  }, [convertToReactFlow, setNodes, setEdges])

  // Connection validation function
  const isValidConnection = useCallback((connection: Connection | Edge) => {
    // Handle both Connection and Edge types
    const source = 'source' in connection ? connection.source : null
    const target = 'target' in connection ? connection.target : null
    
    if (!source || !target) return false
    
    // Prevent self-connections
    if (source === target) return false
    
    // Check if connection already exists
    const connectionExists = edges.some(edge => 
      edge.source === source && edge.target === target
    )
    if (connectionExists) return false
    
    // Additional validation: prevent circular dependencies (basic check)
    const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
      const visited = new Set<string>()
      const stack = [targetId]
      
      while (stack.length > 0) {
        const currentId = stack.pop()!
        if (currentId === sourceId) return true
        if (visited.has(currentId)) continue
        visited.add(currentId)
        
        // Find all nodes that this node connects to
        const outgoingEdges = edges.filter(edge => edge.source === currentId)
        outgoingEdges.forEach(edge => stack.push(edge.target))
      }
      
      return false
    }
    
    if (wouldCreateCycle(source, target)) {
      console.warn('Connection would create a cycle')
      return false
    }
    
    return true
  }, [edges])

  // Enhanced connection handler with validation and workflow store update
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return
      
      // Prevent self-connections
      if (params.source === params.target) return
      
      // Check if connection already exists
      const connectionExists = edges.some(edge => 
        edge.source === params.source && edge.target === params.target
      )
      if (connectionExists) return

      // Add edge with enhanced n8n-like styling
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#4f46e5', 
          strokeWidth: 6, // Increased width for better visibility
          opacity: 0.8 
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: '#4f46e5',
          width: 26, // Larger arrow
          height: 26
        }
      }, eds))

      // Update the workflow store with new connection
      if (workflow && params.source && params.target) {
        const sourceNode = workflow.nodes.find(n => n.id === params.source)
        const targetNode = workflow.nodes.find(n => n.id === params.target)
        
        if (sourceNode && targetNode) {
          const updatedWorkflow = { ...workflow }
          
          if (!updatedWorkflow.connections[sourceNode.name]) {
            updatedWorkflow.connections[sourceNode.name] = {}
          }
          
          const sourceConnection = updatedWorkflow.connections[sourceNode.name]
          if (sourceConnection && !sourceConnection.main) {
            sourceConnection.main = []
          }
          
          // Add new connection
          if (sourceConnection && sourceConnection.main) {
            sourceConnection.main.push([{
              node: targetNode.name,
              type: 'main',
              index: 0
            }])
          }
          
          setWorkflow(updatedWorkflow)
        }
      }
    },
    [setEdges, edges, workflow, setWorkflow]
  )

  // Enhanced node change handler with position updates
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)
      
      // Update workflow store when nodes are moved
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && workflow) {
          const nodeIndex = workflow.nodes.findIndex(n => n.id === change.id)
          if (nodeIndex !== -1) {
            const updatedWorkflow = { ...workflow }
            const existingNode = updatedWorkflow.nodes[nodeIndex]
            if (existingNode) {
              updatedWorkflow.nodes[nodeIndex] = {
                ...existingNode,
                position: [change.position.x, change.position.y]
              }
              setWorkflow(updatedWorkflow)
            }
          }
        }
      })
    },
    [onNodesChange, workflow, setWorkflow]
  )

  // Enhanced edge change handler with workflow store updates
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes)
      
      // Update workflow store when edges are removed
      changes.forEach((change) => {
        if (change.type === 'remove' && workflow) {
          const edge = edges.find(e => e.id === change.id)
          if (edge) {
            const sourceNode = workflow.nodes.find(n => n.id === edge.source)
            const targetNode = workflow.nodes.find(n => n.id === edge.target)
            
            if (sourceNode && targetNode) {
              const updatedWorkflow = { ...workflow }
              const connections = updatedWorkflow.connections[sourceNode.name]
              
              if (connections && connections.main) {
                // Remove the specific connection
                connections.main = connections.main.filter(connArray =>
                  !connArray.some(conn => conn.node === targetNode.name)
                )
                
                // Clean up empty connection arrays
                if (connections.main.length === 0) {
                  delete connections.main
                }
                
                // Clean up empty connection objects
                if (Object.keys(connections).length === 0) {
                  delete updatedWorkflow.connections[sourceNode.name]
                }
              }
              
              setWorkflow(updatedWorkflow)
            }
          }
        }
      })
    },
    [onEdgesChange, edges, workflow, setWorkflow]
  )

  // Workflow statistics
  const workflowStats = useMemo(() => {
    if (!workflow) return null
    
    const totalNodes = workflow.nodes.length
    const disabledNodes = workflow.nodes.filter(n => n.disabled).length
    const activeNodes = totalNodes - disabledNodes
    const totalConnections = edges.length
    
    return { totalNodes, activeNodes, disabledNodes, totalConnections }
  }, [workflow, edges])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive bg-destructive/5">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-destructive/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium mb-2 text-foreground">Workflow Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-background">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-lg font-medium mb-2 text-foreground">No Workflow Generated</p>
          <p className="text-sm">Enter a prompt in the chat to generate your n8n workflow and see the visual preview here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-background relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Converting workflow...</p>
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 120, // More padding for better visibility
          includeHiddenNodes: false,
          minZoom: 0.3,
          maxZoom: 1.0
        }}
        attributionPosition="bottom-left"
        className={`bg-background ${isSpacePressed ? 'cursor-zoom-in' : ''}`}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        multiSelectionKeyCode="Shift"
        deleteKeyCode="Delete"
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[15, 15]}
        connectionMode={ConnectionMode.Loose}
        panOnScroll={true}
        panOnScrollSpeed={0.5}
        zoomOnScroll={!isSpacePressed}
        zoomOnPinch={true}
        panOnDrag={!isSpacePressed}
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#4f46e5', 
            strokeWidth: 2,
            opacity: 0.9 
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: '#4f46e5',
            width: 10,
            height: 10
          }
        }}
        onNodeDragStop={(_event, node) => {
          // Ensure position is updated in the workflow store
          if (workflow) {
            const nodeIndex = workflow.nodes.findIndex(n => n.id === node.id)
            if (nodeIndex !== -1) {
              const updatedWorkflow = { ...workflow }
              const existingNode = updatedWorkflow.nodes[nodeIndex]
              if (existingNode) {
                updatedWorkflow.nodes[nodeIndex] = {
                  ...existingNode,
                  position: [node.position.x, node.position.y]
                }
                setWorkflow(updatedWorkflow)
              }
            }
          }
        }}
        onConnectStart={(_event, { nodeId, handleType }) => {
          // Visual feedback when starting to connect
          console.log('Connection started from:', nodeId, handleType)
        }}
        onConnectEnd={(_event) => {
          // Visual feedback when connection ends
          console.log('Connection ended')
        }}
      >
        <Background 
          color="hsl(var(--muted-foreground))"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
          style={{
            backgroundColor: 'hsl(var(--background))',
          }}
        />
        

        
        {/* Workflow information panel */}
        <Panel position="top-left" className="bg-card border border-border rounded-lg shadow-sm p-4">
          <div className="text-sm space-y-2">
            <h3 className="font-semibold text-foreground">
              {workflow.name || 'Unnamed Workflow'}
            </h3>
            {workflowStats && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Total Nodes: <span className="font-medium text-foreground">{workflowStats.totalNodes}</span></div>
                <div>Active: <span className="font-medium text-green-600">{workflowStats.activeNodes}</span></div>
                <div>Disabled: <span className="font-medium text-muted-foreground">{workflowStats.disabledNodes}</span></div>
                <div>Connections: <span className="font-medium text-foreground">{workflowStats.totalConnections}</span></div>
              </div>
            )}
          </div>
        </Panel>

        {/* Flow controls with minimap */}
        <FlowControls />
        
        {/* Spacebar zoom indicator */}
        {isSpacePressed && (
          <Panel position="bottom-left" className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>🔍</span>
              <span>Scroll to zoom</span>
            </div>
          </Panel>
        )}
        


        {/* Workflow Validation - Hidden but still runs validation for node colors */}
        {workflow && (
          <div style={{ display: 'none' }}>
            <WorkflowValidator 
              workflow={workflow}
              onValidationResult={handleValidationResult}
              showVisualFeedback={false}
            />
          </div>
        )}
      </ReactFlow>

      {/* Node Editor Modal */}
      <NodeEditor
        node={editingNode}
        isOpen={isNodeEditorOpen}
        onClose={() => {
          setIsNodeEditorOpen(false)
          setEditingNode(null)
        }}
        onSave={handleSaveNode}
      />
    </div>
  )
}

export default function WorkflowVisualization() {
  return (
    <ReactFlowProvider>
      <WorkflowVisualizationInner />
    </ReactFlowProvider>
  )
}