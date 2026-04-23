'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getBestLevel } from '@/lib/types'
import { getHorseTier } from './horse-icon'

const KEY = 'stabledex_watched'
const SEEN_KEY = 'stabledex_seen_results'

interface WatchedHorse {
  id: string
  name: string
  breed: string
  results: Array<{ id: string; created_at: string; competition: { level: string } | null }>
}

export default function WatchedHorses() {
  const [horses, setHorses] = useState<WatchedHorse[]>([])
  const [newResults, setNewResults] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      let ids: string[] = []
      try { ids = JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch {}
      if (ids.length === 0) return

      const seenRaw: Record<string, string> = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}')
      const supabase = createClient()
      const { data } = await supabase
        .from('horses')
        .select('id, name, breed, results(id, created_at, competition:competitions(level))')
        .in('id', ids)

      const rows = (data ?? []) as unknown as WatchedHorse[]
      setHorses(rows)

      const hasNew = new Set<string>()
      for (const h of rows) {
        const latestResult = [...h.results].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
        if (latestResult && seenRaw[h.id] && latestResult.created_at > seenRaw[h.id]) {
          hasNew.add(h.id)
        }
        if (latestResult && !seenRaw[h.id]) {
          seenRaw[h.id] = latestResult.created_at
        }
      }
      localStorage.setItem(SEEN_KEY, JSON.stringify(seenRaw))
      setNewResults(hasNew)
    }
    load()
  }, [])

  function unwatch(id: string) {
    setHorses((prev) => prev.filter((h) => h.id !== id))
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      localStorage.setItem(KEY, JSON.stringify(ids.filter((x) => x !== id)))
    } catch {}
  }

  if (horses.length === 0) return null

  return (
    <div className="w-52 border border-[0.5px] border-white/[.07] rounded-xl bg-[#111111] overflow-hidden">
      <div className="px-4 py-3 border-b border-[0.5px] border-white/[.06]">
        <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium">Watchlist</p>
      </div>
      <div className="flex flex-col">
        {horses.map((h) => {
          const levels = h.results.map((r) => r.competition?.level).filter(Boolean) as string[]
          const tier = getHorseTier(levels.length > 0 ? getBestLevel(levels) : null)
          const dotColor = tier === 'gold' ? '#fbbf24' : tier === 'silver' ? '#cbd5e1' : '#4b5563'

          return (
            <div key={h.id} className="group flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[.03] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
              <Link
                href={`/horse/${h.id}`}
                className="flex-1 min-w-0 text-xs text-[#9ca3af] hover:text-[#f2f2f2] truncate transition-colors"
              >
                {h.name}
              </Link>
              {newResults.has(h.id) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="New result" />
              )}
              <button
                onClick={() => unwatch(h.id)}
                className="opacity-0 group-hover:opacity-100 text-[#4b5563] hover:text-[#f2f2f2] transition-all text-xs leading-none"
                title="Remove"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
