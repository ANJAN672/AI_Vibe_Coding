'use client'

import { useState } from 'react'
import PromptInput from '@/components/PromptInput'
import CodeEditor from '@/components/CodeEditor'
import WorkflowVisualization from '@/components/WorkflowVisualization'
import Settings from '@/components/Settings'
import { useWorkflowStore } from '@/store/workflowStore'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { workflow } = useWorkflowStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
              alt="AI Vibe Coding Platform Logo" 
              className="h-8 w-8 rounded-lg"
            />
            <h1 className="text-xl font-bold text-gray-900">AI Vibe Coding Platform</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Settings />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
          <div className="h-full p-4 overflow-y-auto">
            <PromptInput />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Code Editor Panel */}
            <Panel defaultSize={50} minSize={30}>
              <CodeEditor className="h-full" />
            </Panel>
            
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
            
            {/* Workflow Graph Panel */}
            <Panel defaultSize={50} minSize={30}>
              <WorkflowVisualization />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  )
}