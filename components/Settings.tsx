'use client'

import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown } from 'lucide-react'

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
    setMistralApiKey
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
      default: return ''
    }
  }

  const getApiKeyHelp = () => {
    switch (selectedModel) {
      case 'openai': return 'Get your API key from platform.openai.com'
      case 'gemini': return 'Get your API key from aistudio.google.com'
      case 'claude': return 'Get your API key from console.anthropic.com'
      case 'mistral': return 'Get your API key from console.mistral.ai'
      default: return ''
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
          <span className="text-lg">⚙️</span>
          <span className="hidden sm:inline">Settings</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">AI Model</Label>
            <Select value={selectedModel} onValueChange={(value: 'openai' | 'gemini' | 'claude' | 'mistral') => setSelectedModel(value)}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="claude">Anthropic Claude</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={getApiKeyPlaceholder()}
              value={getApiKeyForModel()}
              onChange={(e) => setApiKeyForModel(e.target.value)}
              className="bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500">
              {getApiKeyHelp()}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}