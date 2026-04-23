import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav'
import CompareBar from '@/components/compare-bar'
import CommandPalette from '@/components/command-palette'
import BottomTabBar from '@/components/bottom-tab-bar'
import SwipeBack from '@/components/swipe-back'
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

// Runs synchronously before first paint — sets data-theme without flash
const themeInitScript = `(function(){var r=document.documentElement,s;try{s=localStorage.getItem('app-theme')}catch(e){}var p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches;r.setAttribute('data-theme',s||(p?'light':'dark'));})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>
          <Nav />
          <main className="flex-1 pb-14 sm:pb-0">{children}</main>
          <SwipeBack />
          <CompareBar />
          <CommandPalette />
          <BottomTabBar />
        </ToastProvider>
      </body>
    </html>
  )
}
