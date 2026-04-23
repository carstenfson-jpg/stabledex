'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getBestLevel } from '@/lib/types'
import { getHorseTier } from './horse-icon'

const KEY = 'stabledex_watched'
const SEEN_KEY = 'stabledex_seen_results'

interface WatchedHorse {
  id: string
  name: string
  results: Array<{ id: string; created_at: string; competition: { level: string } | null }>
}

export default function NavWatchlist() {
  const [open, setOpen] = useState(false)
  const [horses, setHorses] = useState<WatchedHorse[]>([])
  const [newResults, setNewResults] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      let ids: string[] = []
      try { ids = JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch {}
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

    function onStorage() { load() }
    window.addEventListener('stabledex_watch', onStorage)
    return () => window.removeEventListener('stabledex_watch', onStorage)
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function unwatch(id: string) {
    setHorses((prev) => prev.filter((h) => h.id !== id))
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      localStorage.setItem(KEY, JSON.stringify(ids.filter((x) => x !== id)))
    } catch {}
  }

  const hasNew = horses.some((h) => newResults.has(h.id))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          open ? 'text-[#f2f2f2]' : 'text-[#6b7280] hover:text-[#f2f2f2]'
        }`}
      >
        <span className="relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={horses.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {hasNew && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </span>
        Watchlist
        {horses.length > 0 && (
          <span className="text-[10px] text-[#4b5563] tabular-nums">({horses.length})</span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-56 bg-[#111111] border border-[0.5px] border-white/[.1] rounded-xl shadow-xl overflow-hidden z-50">
          {horses.length === 0 ? (
            <p className="text-xs text-[#4b5563] px-4 py-4 text-center">No horses watched yet</p>
          ) : (
            <>
              <div className="px-4 py-2.5 border-b border-white/[.06]">
                <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium">Watchlist</p>
              </div>
              {horses.map((h) => {
                const levels = h.results.map((r) => r.competition?.level).filter(Boolean) as string[]
                const tier = getHorseTier(levels.length > 0 ? getBestLevel(levels) : null)
                const dotColor = tier === 'gold' ? '#fbbf24' : tier === 'silver' ? '#cbd5e1' : '#4b5563'
                return (
                  <div key={h.id} className="group flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[.03] transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                    <Link
                      href={`/horse/${h.id}`}
                      onClick={() => setOpen(false)}
                      className="flex-1 min-w-0 text-xs text-[#9ca3af] hover:text-[#f2f2f2] truncate transition-colors"
                    >
                      {h.name}
                    </Link>
                    {newResults.has(h.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="New result" />
                    )}
                    <button
                      onClick={() => unwatch(h.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#4b5563] hover:text-[#f2f2f2] transition-all text-sm leading-none"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
