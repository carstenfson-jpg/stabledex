'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BottomTabBar() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') ?? 'dark') as 'dark' | 'light'
    setTheme(t)
    function onTheme(e: Event) { setTheme((e as CustomEvent).detail as 'dark' | 'light') }
    window.addEventListener('themechange', onTheme)
    return () => window.removeEventListener('themechange', onTheme)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('app-theme', next) } catch {}
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }))
    setTheme(next)
  }

  const tabs = [
    {
      label: 'Database',
      href: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Rankings',
      href: '/rankings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21H5a2 2 0 01-2-2v-5a2 2 0 012-2h3m8 8h3a2 2 0 002-2v-5a2 2 0 00-2-2h-3m-4 9V8" />
          <path d="M12 3l2 4H10l2-4z" />
        </svg>
      ),
    },
    {
      label: 'My Stable',
      href: '/stable',
      icon: (
        <svg width="20" height="20" viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10,70 100,8 190,70" />
          <rect x="14" y="68" width="172" height="84" />
          <line x1="68" y1="68" x2="68" y2="152" />
          <line x1="132" y1="68" x2="132" y2="152" />
          <line x1="14" y1="114" x2="68" y2="114" />
          <line x1="132" y1="114" x2="186" y2="114" />
          <line x1="100" y1="68" x2="100" y2="114" />
        </svg>
      ),
    },
    {
      label: 'Events',
      href: '/events',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/[.07] z-40 flex sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(56px + env(safe-area-inset-bottom))' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-emerald-400' : 'text-[#4b5563]'
            }`}
          >
            {tab.icon}
            <span className="text-[9px]">{tab.label}</span>
          </Link>
        )
      })}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex-1 flex flex-col items-center justify-center gap-1 text-[#4b5563] transition-colors active:text-[#9ca3af]"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
        <span className="text-[9px]">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </div>
  )
}
