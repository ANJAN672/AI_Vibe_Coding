'use client'

import { useState } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PromptInput() {
  const { 
    prompt, 
    setPrompt, 
    generateWorkflow, 
    isLoading, 
    error
  } = useWorkflowStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateWorkflow()
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Generate n8n Workflow
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Describe your automation workflow
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to automate..."
              className="min-h-[120px] bg-white border-gray-300 resize-none"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Generate Workflow
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}