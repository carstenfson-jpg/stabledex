'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-14 bg-[#0f0f0f] border-t border-white/[.07] z-40 flex sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
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
    </div>
  )
}
