'use client'

import { useState, useEffect } from 'react'
import PromptInput from '@/components/PromptInput'
import CodeEditor from '@/components/CodeEditor'
import WorkflowVisualization from '@/components/WorkflowVisualization'
import Settings from '@/components/Settings'
import { useWorkflowStore } from '@/store/workflowStore'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Menu, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeployModal from '@/components/DeployModal'
import { ToastContainer, useToast } from '@/components/Toast'

export default function Home() {
  const { workflow } = useWorkflowStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const toast = useToast()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if we're not in an input/textarea/contenteditable element
      const target = event.target as HTMLElement
      const isInputElement = target?.tagName === 'INPUT' || 
                            target?.tagName === 'TEXTAREA' || 
                            target?.contentEditable === 'true'
      
      // Ctrl/Cmd + B: Toggle sidebar (only if not in input)
      if ((event.ctrlKey || event.metaKey) && event.key === 'b' && !isInputElement) {
        event.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      
      // Ctrl/Cmd + D: Deploy workflow (only if not in input)
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && workflow && !isInputElement) {
        event.preventDefault()
        setIsDeployModalOpen(true)
      }
      
      // Escape: Close modals (allow in inputs for clearing them)
      if (event.key === 'Escape') {
        if (isDeployModalOpen) {
          setIsDeployModalOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [workflow, isDeployModalOpen])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="agen8 vibe coding platform Logo" 
              className="h-8 w-8 rounded-lg"
            />
            <h1 className="text-xl font-bold text-gray-900">agen8 vibe coding platform</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDeployModalOpen(true)}
            disabled={!workflow}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hidden sm:flex"
          >
            <Upload className="h-4 w-4 mr-2" />
            Deploy to n8n
          </Button>
          {/* Mobile Deploy Button */}
          <Button
            onClick={() => setIsDeployModalOpen(true)}
            disabled={!workflow}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white sm:hidden"
            size="sm"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Settings />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80 sm:w-96' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 ${sidebarOpen ? 'fixed sm:relative z-30 h-full' : ''}`}>
          <div className="h-full p-4 overflow-y-auto">
            <PromptInput />
          </div>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Code Editor Panel */}
            <Panel defaultSize={50} minSize={30}>
              <CodeEditor className="h-full" />
            </Panel>
            
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors hidden sm:block" />
            
            {/* Workflow Graph Panel */}
            <Panel defaultSize={50} minSize={30}>
              <WorkflowVisualization />
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Deploy Modal */}
      <DeployModal
        workflow={workflow}
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onSuccess={(message) => toast.success('Deployment Successful', message)}
        onError={(message) => toast.error('Deployment Failed', message)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  )
}