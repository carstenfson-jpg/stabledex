'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const KEY = 'stabledex:stable'
const EV = 'stabledex_stable'

export default function NavStableLink() {
  const [count, setCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(KEY)
        const parsed = raw ? JSON.parse(raw) : []
        setCount(Array.isArray(parsed) ? parsed.length : 0)
      } catch {}
    }
    load()
    window.addEventListener(EV, load)
    return () => window.removeEventListener(EV, load)
  }, [])

  return (
    <Link
      href="/stable"
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        pathname === '/stable' ? 'text-[#f2f2f2]' : 'text-[#6b7280] hover:text-[#f2f2f2]'
      }`}
    >
      My Stable
      {count > 0 && (
        <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full text-[10px] tabular-nums bg-emerald-500/15 text-emerald-400">
          {count}
        </span>
      )}
    </Link>
  )
}
