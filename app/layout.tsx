import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import CompareBar from '@/components/compare-bar'
import CommandPalette from '@/components/command-palette'
import BottomTabBar from '@/components/bottom-tab-bar'
import { ToastProvider } from '@/components/toast'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

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
          <main className="flex-1 pb-14 sm:pb-0">{children}</main>
          <CompareBar />
          <CommandPalette />
          <BottomTabBar />
        </ToastProvider>
      </body>
    </html>
  )
}
