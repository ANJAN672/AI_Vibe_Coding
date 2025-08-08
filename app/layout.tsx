
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'agen8 vibe coding platform - n8n Workflow Generator',
  description: 'Generate n8n workflows from natural language prompts with AI-powered automation',
  keywords: ['n8n', 'workflow', 'automation', 'AI', 'no-code', 'low-code'],
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}