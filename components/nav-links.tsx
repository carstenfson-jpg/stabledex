'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const KEY = 'stabledex:stable'
const EV = 'stabledex_stable'

const LINKS = [
  { href: '/', label: 'Database', exact: true },
  { href: '/rankings', label: 'Rankings', exact: false },
  { href: '/events', label: 'Events', exact: false },
]

export default function NavLinks() {
  const pathname = usePathname()
  const [stableCount, setStableCount] = useState(0)

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(KEY)
        const parsed = raw ? JSON.parse(raw) : []
        setStableCount(Array.isArray(parsed) ? parsed.length : 0)
      } catch {}
    }
    load()
    window.addEventListener(EV, load)
    return () => window.removeEventListener(EV, load)
  }, [])

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <div className="hidden sm:flex items-center gap-6">
      {LINKS.map(({ href, label, exact }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm transition-colors ${
            isActive(href, exact) ? 'text-[#f2f2f2] font-medium' : 'text-[#6b7280] hover:text-[#f2f2f2]'
          }`}
        >
          {label}
        </Link>
      ))}

      {/* My Stable with badge */}
      <Link
        href="/stable"
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          pathname === '/stable' ? 'text-[#f2f2f2] font-medium' : 'text-[#6b7280] hover:text-[#f2f2f2]'
        }`}
      >
        My Stable
        {stableCount > 0 && (
          <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full text-[10px] tabular-nums bg-emerald-500/15 text-emerald-400">
            {stableCount}
          </span>
        )}
      </Link>
    </div>
  )
}
