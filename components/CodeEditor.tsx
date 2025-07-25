'use client'

import { useWorkflowStore } from '@/store/workflowStore'
import { Editor } from '@monaco-editor/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload, Copy, Check } from 'lucide-react'

interface CodeEditorProps {
  className?: string
}

export default function CodeEditor({ className }: CodeEditorProps) {
  const { workflow, jsonCode, setJsonCode, exportWorkflow, importWorkflow } = useWorkflowStore()
  const [copied, setCopied] = useState(false)

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setJsonCode(value)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          importWorkflow(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Workflow JSON</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportWorkflow}
            disabled={!workflow}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={jsonCode}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            readOnly: false,
          }}
        />
      </div>
    </div>
  )
}