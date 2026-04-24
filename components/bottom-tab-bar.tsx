'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getBestLevel } from '@/lib/types'
import { getHorseTier } from './horse-icon'

const WATCH_KEY = 'stabledex_watched'
const SEEN_KEY  = 'stabledex_seen_results'

interface WatchedHorse {
  id: string
  name: string
  results: Array<{ id: string; created_at: string; competition: { level: string } | null }>
}

const TABS = [
  {
    label: 'Database', href: '/', exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Rankings', href: '/rankings', exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21H5a2 2 0 01-2-2v-5a2 2 0 012-2h3m8 8h3a2 2 0 002-2v-5a2 2 0 00-2-2h-3m-4 9V8" />
        <path d="M12 3l2 4H10l2-4z" />
      </svg>
    ),
  },
  {
    label: 'My Stable', href: '/stable', exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="10,70 100,8 190,70" />
        <rect x="14" y="68" width="172" height="84" />
        <line x1="68" y1="68" x2="68" y2="152" /><line x1="132" y1="68" x2="132" y2="152" />
        <line x1="14" y1="114" x2="68" y2="114" /><line x1="132" y1="114" x2="186" y2="114" />
        <line x1="100" y1="68" x2="100" y2="114" />
      </svg>
    ),
  },
  {
    label: 'Events', href: '/events', exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  const [watchOpen, setWatchOpen] = useState(false)
  const [horses, setHorses] = useState<WatchedHorse[]>([])
  const [newResults, setNewResults] = useState<Set<string>>(new Set())

  // Signal to SwipeBack that a sheet is open
  useEffect(() => {
    if (watchOpen) {
      document.body.setAttribute('data-sheet', 'open')
    } else {
      document.body.removeAttribute('data-sheet')
    }
  }, [watchOpen])

  useEffect(() => {
    async function load() {
      let ids: string[] = []
      try { ids = JSON.parse(localStorage.getItem(WATCH_KEY) ?? '[]') } catch {}
      if (ids.length === 0) { setHorses([]); return }

      const seenRaw: Record<string, string> = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}')
      const supabase = createClient()
      const { data } = await supabase
        .from('horses')
        .select('id, name, results(id, created_at, competition:competitions(level))')
        .in('id', ids)

      const rows = (data ?? []) as unknown as WatchedHorse[]
      setHorses(rows)

      const hasNew = new Set<string>()
      for (const h of rows) {
        const latest = [...h.results].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
        if (latest && seenRaw[h.id] && latest.created_at > seenRaw[h.id]) hasNew.add(h.id)
        if (latest && !seenRaw[h.id]) seenRaw[h.id] = latest.created_at
      }
      localStorage.setItem(SEEN_KEY, JSON.stringify(seenRaw))
      setNewResults(hasNew)
    }
    load()
    window.addEventListener('stabledex_watch', load)
    return () => window.removeEventListener('stabledex_watch', load)
  }, [])

  const hasNew = horses.some((h) => newResults.has(h.id))

  function unwatch(id: string) {
    setHorses((prev) => prev.filter((h) => h.id !== id))
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(WATCH_KEY) ?? '[]')
      localStorage.setItem(WATCH_KEY, JSON.stringify(ids.filter((x) => x !== id)))
    } catch {}
  }

  return (
    <>
      {/* Watchlist bottom sheet */}
      <AnimatePresence>
        {watchOpen && (
          <>
            <motion.div
              key="watchlist-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[60] sm:hidden"
              onClick={() => setWatchOpen(false)}
            />
            <motion.div
              key="watchlist-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => { if (info.offset.y > 60) setWatchOpen(false) }}
              className="fixed left-0 right-0 z-[61] sm:hidden bg-[#1a1a1a] border-t border-white/[.08] rounded-t-2xl overflow-hidden"
              style={{ bottom: 'calc(56px + env(safe-area-inset-bottom))', paddingBottom: 4 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle — tap or drag down to close */}
              <div className="flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setWatchOpen(false)}>
                <div className="w-9 h-1 bg-white/20 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[.06]">
                <p className="text-[11px] uppercase tracking-widest text-[#4b5563] font-medium">Watchlist</p>
                <button onClick={() => setWatchOpen(false)} className="text-[#4b5563] text-lg leading-none">×</button>
              </div>
              {horses.length === 0 ? (
                <p className="text-xs text-[#4b5563] px-4 py-6 text-center">No horses watched yet</p>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {horses.map((h) => {
                    const levels = h.results.map((r) => r.competition?.level).filter(Boolean) as string[]
                    const tier = getHorseTier(levels.length > 0 ? getBestLevel(levels) : null)
                    const dotColor = tier === 'gold' ? '#fbbf24' : tier === 'silver' ? '#cbd5e1' : '#4b5563'
                    return (
                      <div key={h.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[.05] last:border-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                        <Link
                          href={`/horse/${h.id}`}
                          onClick={() => setWatchOpen(false)}
                          className="flex-1 text-sm text-[#9ca3af] truncate"
                        >
                          {h.name}
                        </Link>
                        {newResults.has(h.id) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                        <button onClick={() => unwatch(h.id)} className="text-[#4b5563] text-lg leading-none px-1">×</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/[.07] z-40 flex sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(56px + env(safe-area-inset-bottom))' }}
      >
        {TABS.map(({ href, label, exact, icon }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'text-emerald-400' : 'text-[#4b5563]'}`}
            >
              {icon}
              <span className="text-[9px]">{label}</span>
            </Link>
          )
        })}

        {/* Watchlist star tab */}
        <button
          onClick={() => setWatchOpen((o) => !o)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${watchOpen ? 'text-[#f2f2f2]' : 'text-[#4b5563]'}`}
        >
          <span className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={horses.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {hasNew && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </span>
          <span className="text-[9px]">Watchlist</span>
        </button>
      </div>
    </>
  )
}
