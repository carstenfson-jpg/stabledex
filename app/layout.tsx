import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import CompareBar from '@/components/compare-bar'
import CommandPalette from '@/components/command-palette'
import { ToastProvider } from '@/components/toast'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Stabledex — European Horse Competition Database',
  description:
    'Search and explore competition results across Europe. Track horses, riders, and rankings for show jumping, dressage, and eventing.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-[#f2f2f2] antialiased">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <CompareBar />
          <CommandPalette />
        </ToastProvider>
      </body>
    </html>
  )
}
