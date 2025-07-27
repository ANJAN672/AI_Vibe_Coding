'use client'

import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Settings as SettingsIcon, User, Key, Brain, Database } from 'lucide-react'

export default function Settings() {
  const { 
    selectedModel,
    setSelectedModel,
    openaiApiKey,
    setOpenaiApiKey,
    geminiApiKey,
    setGeminiApiKey,
    claudeApiKey,
    setClaudeApiKey,
    mistralApiKey,
    setMistralApiKey,
    isMemoryEnabled,
    toggleMemory
  } = useWorkflowStore()
  
  const [open, setOpen] = useState(false)

  const getApiKeyForModel = () => {
    switch (selectedModel) {
      case 'openai': return openaiApiKey
      case 'gemini': return geminiApiKey
      case 'claude': return claudeApiKey
      case 'mistral': return mistralApiKey
      default: return ''
    }
  }

  const setApiKeyForModel = (value: string) => {
    switch (selectedModel) {
      case 'openai': setOpenaiApiKey(value); break
      case 'gemini': setGeminiApiKey(value); break
      case 'claude': setClaudeApiKey(value); break
      case 'mistral': setMistralApiKey(value); break
    }
  }

  const getApiKeyPlaceholder = () => {
    switch (selectedModel) {
      case 'openai': return 'sk-...'
      case 'gemini': return 'AI...'
      case 'claude': return 'sk-ant-...'
      case 'mistral': return 'api_key...'
      default: return 'Enter API key'
    }
  }

  const hasApiKey = !!getApiKeyForModel()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <SettingsIcon className="h-4 w-4" />
            <h3 className="font-semibold text-foreground">Settings</h3>
          </div>
          
          {/* Memory Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <Label htmlFor="memory-toggle" className="text-sm font-medium">
                  Chat Memory
                </Label>
              </div>
              <Switch
                id="memory-toggle"
                checked={isMemoryEnabled}
                onCheckedChange={toggleMemory}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isMemoryEnabled 
                ? '✅ Conversations are saved and can be resumed'
                : '❌ Conversations are not saved between sessions'
              }
            </p>
          </div>

          <div className="border-t border-border pt-4">
            {/* AI Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="claude">Anthropic Claude</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* API Key Input */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Key className="h-3.5 w-3.5" />
                <Label htmlFor="apikey" className="text-sm font-medium">
                  {selectedModel.toUpperCase()} API Key
                </Label>
                {hasApiKey && (
                  <span className="text-xs status-connected px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                )}
              </div>
              <Input
                id="apikey"
                type="password"
                placeholder={getApiKeyPlaceholder()}
                value={getApiKeyForModel()}
                onChange={(e) => setApiKeyForModel(e.target.value)}
                className="w-full rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

            {/* Model Info */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/50 mt-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Current:</strong> {selectedModel.toUpperCase()}</p>
                <p><strong>Status:</strong> {hasApiKey ? '✅ Ready' : '❌ API key required'}</p>
                <p><strong>Memory:</strong> {isMemoryEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
              </div>
            </div>

            {/* Quick Setup Links */}
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-muted-foreground">Get API Keys:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted/50 hover:bg-muted rounded-md text-center transition-colors"
                >
                  OpenAI
                </a>
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted/50 hover:bg-muted rounded-md text-center transition-colors"
                >
                  Gemini
                </a>
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted/50 hover:bg-muted rounded-md text-center transition-colors"
                >
                  Claude
                </a>
                <a 
                  href="https://console.mistral.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-muted/50 hover:bg-muted rounded-md text-center transition-colors"
                >
                  Mistral
                </a>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}