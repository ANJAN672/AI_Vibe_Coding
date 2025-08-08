'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

const Toast = ({ toast, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto dismiss
    if (toast.duration !== 0) {
      const dismissTimer = setTimeout(() => {
        handleClose()
      }, toast.duration || 5000)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(dismissTimer)
      }
    }
    
    return () => clearTimeout(timer)
  }, [toast.duration, toast.id])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-400'
      case 'info':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
    }
  }

  return (
    <div
      className={`
        relative transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border-l-4 ${getColors()}
      `}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight text-left mb-1">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words text-left whitespace-pre-wrap">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toast.action.onClick}
                  className="text-xs"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    addToast({ type: 'success', title, message: message || '', ...options })
  }

  const error = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    addToast({ type: 'error', title, message: message || '', ...options })
  }

  const warning = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    addToast({ type: 'warning', title, message: message || '', ...options })
  }

  const info = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    addToast({ type: 'info', title, message: message || '', ...options })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}