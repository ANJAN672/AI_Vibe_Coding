'use client'

// Force dynamic rendering for Supabase in production
export const dynamic = "force-dynamic"

import { useState, useEffect } from 'react'
import CodeEditor from '@/components/CodeEditor'
import WorkflowVisualization from '@/components/WorkflowVisualization'
import Settings from '@/components/Settings'
import { ChatInterface } from '@/components/ChatInterface'
import { useWorkflowStore } from '@/store/workflowStore'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { PanelLeftClose, PanelLeft, User, Github, Zap, Sun, Moon, Play, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DeployModal from '@/components/DeployModal'
import { ToastContainer, useToast } from '@/components/Toast'
import Image from 'next/image'

export default function Home() {
  const { workflow, isMemoryEnabled, sessionId, startNewSession } = useWorkflowStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const toast = useToast()

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  // Debug environment variables for production
  useEffect(() => {
    console.log('🌍 Production Environment Check:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Missing ❌')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌')
  }, [])

  // Initialize session on app load if memory is enabled
  useEffect(() => {
    const initializeSession = async () => {
      if (isMemoryEnabled && !sessionId) {
        const savedSessionId = localStorage.getItem('current_session_id')
        if (savedSessionId) {
          try {
            const { loadSession } = useWorkflowStore.getState()
            await loadSession(savedSessionId)
          } catch (error) {
            console.error('Failed to load saved session:', error)
            await startNewSession()
          }
        } else {
          await startNewSession()
        }
      }
    }

    initializeSession()
  }, [isMemoryEnabled, sessionId, startNewSession])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInputElement = target?.tagName === 'INPUT' || 
                            target?.tagName === 'TEXTAREA' || 
                            target?.contentEditable === 'true'
      
      // Ctrl/Cmd + B: Toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b' && !isInputElement) {
        event.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      
      // Ctrl/Cmd + D: Deploy workflow
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && workflow && !isInputElement) {
        event.preventDefault()
        setIsDeployModalOpen(true)
      }
      
      // Escape: Close modals
      if (event.key === 'Escape') {
        if (isDeployModalOpen) {
          setIsDeployModalOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [workflow, isDeployModalOpen])

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header - Lovable.dev style */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center">
              <Image
                src="/favicon.png"
                alt="AGEN8 Logo"
                width={24}
                height={24}
                className="rounded-md"
              />
            </div>
            <span className="text-foreground font-medium">AGEN8</span>
            <button className="text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Sidebar Toggle - Above Preview/Code tabs */}
        <div className="flex-1 flex justify-start pl-8">
          <Button
            onClick={handleToggleSidebar}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
            >
              <User className="h-4 w-4 mr-1" />
              Invite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
            >
              <Zap className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Settings />
            <Button
              onClick={() => setIsDeployModalOpen(true)}
              disabled={!workflow}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <PanelGroup direction="horizontal" className="flex-1">
          {/* Left Sidebar - Chat */}
          {sidebarOpen && (
            <>
              <Panel 
                defaultSize={25} 
                minSize={20} 
                maxSize={40}
                className="bg-card border-r border-border"
              >
                <ChatInterface />
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
            </>
          )}

          {/* Main Content Area */}
          <Panel defaultSize={sidebarOpen ? 75 : 100} className="flex flex-col relative min-w-0">
            {/* Tab Navigation */}
            <div className="border-b border-border bg-card flex-shrink-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="h-12 w-full justify-start rounded-none bg-transparent border-0 p-0">
                  <TabsTrigger 
                    value="preview" 
                    className="h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="code" 
                    className="h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent"
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content - Full Width/Height */}
            <div className="flex-1 min-h-0 w-full">
              <Tabs value={activeTab} className="h-full w-full">
                <TabsContent value="preview" className="h-full w-full m-0 p-0">
                  <div className="h-full w-full">
                    <WorkflowVisualization />
                  </div>
                </TabsContent>
                <TabsContent value="code" className="h-full w-full m-0 p-0">
                  <div className="h-full w-full">
                    <CodeEditor className="h-full w-full" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Deploy Modal */}
      <DeployModal
        workflow={workflow}
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onSuccess={(message) => toast.success('🎉 Deployment Successful', message)}
        onError={(message) => toast.error('❌ Deployment Failed', message)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  )
}