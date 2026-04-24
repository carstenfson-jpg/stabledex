'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStable, type StableEntry } from '@/lib/use-stable'
import { getCountryFlag } from '@/lib/types'
import { getHorseTier, HorseIcon } from '@/components/horse-icon'
import BackButton from '@/components/back-button'

type SortKey = 'added' | 'result' | 'age' | 'name'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'added', label: 'Recently added' },
  { key: 'result', label: 'Latest result' },
  { key: 'age', label: 'Age' },
  { key: 'name', label: 'Name A–Z' },
]

function sortEntries(entries: StableEntry[], key: SortKey): StableEntry[] {
  return [...entries].sort((a, b) => {
    switch (key) {
      case 'added':
        return b.added_at.localeCompare(a.added_at)
      case 'result': {
        if (a.latest_place == null && b.latest_place == null) return 0
        if (a.latest_place == null) return 1
        if (b.latest_place == null) return -1
        return a.latest_place - b.latest_place
      }
      case 'age':
        return (b.age ?? -1) - (a.age ?? -1)
      case 'name':
        return a.name.localeCompare(b.name)
    }
  })
}

export default function StablePage() {
  const { saved, remove } = useStable()
  const [sortKey, setSortKey] = useState<SortKey>('added')

  const sorted = sortEntries(saved, sortKey)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <BackButton />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#f2f2f2] tracking-[-0.025em] mb-1">My Stable</h1>
        <p className="text-sm text-[#6b7280]">
          {saved.length === 1 ? '1 horse' : `${saved.length} horses`} you&apos;re tracking
        </p>
      </div>

      {/* Sort chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <span className="text-[10px] tracking-[0.08em] uppercase text-[#4b5563] shrink-0 mr-1">Sort</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortKey(s.key)}
            className={`shrink-0 h-7 px-3 rounded-full text-xs transition-all ${
              sortKey === s.key
                ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
                : 'border border-[0.5px] border-white/[.08] text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {saved.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-5" style={{ color: 'var(--c-muted)', opacity: 0.5 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="96" viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10,70 100,8 190,70" />
              <rect x="86" y="28" width="28" height="26" rx="1" />
              <line x1="86" y1="28" x2="114" y2="54" /><line x1="114" y1="28" x2="86" y2="54" />
              <rect x="14" y="68" width="172" height="84" />
              <line x1="68" y1="68" x2="68" y2="152" /><line x1="132" y1="68" x2="132" y2="152" />
              <line x1="14" y1="114" x2="68" y2="114" />
              <line x1="14" y1="114" x2="68" y2="152" /><line x1="68" y1="114" x2="14" y2="152" />
              <circle cx="41" cy="88" r="10" />
              <path d="M36,82 Q38,74 41,74 Q44,74 46,82" />
              <line x1="41" y1="98" x2="41" y2="104" /><line x1="34" y1="104" x2="48" y2="104" />
              <line x1="68" y1="114" x2="132" y2="114" />
              <line x1="100" y1="68" x2="100" y2="114" />
              <line x1="68" y1="114" x2="100" y2="152" /><line x1="100" y1="114" x2="68" y2="152" />
              <line x1="100" y1="114" x2="132" y2="152" /><line x1="132" y1="114" x2="100" y2="152" />
              <line x1="132" y1="114" x2="186" y2="114" />
              <line x1="132" y1="114" x2="186" y2="152" /><line x1="186" y1="114" x2="132" y2="152" />
              <circle cx="159" cy="88" r="10" />
              <path d="M154,82 Q156,74 159,74 Q162,74 164,82" />
              <line x1="159" y1="98" x2="159" y2="104" /><line x1="152" y1="104" x2="166" y2="104" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#f2f2f2] mb-1 text-center">Your stable is empty</p>
          <p className="text-xs text-[#4b5563] max-w-xs mb-6 text-center">
            Tap &ldquo;+ Add to Stable&rdquo; on any horse profile to track it here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-9 px-5 bg-[#f2f2f2] text-[#0f0f0f] text-sm font-medium rounded-lg hover:bg-white transition-colors"
          >
            Browse database
          </Link>
        </div>
      ) : (
        <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
          {sorted.map((entry) => {
            const tier = getHorseTier(entry.best_level)
            const trendColor = entry.form_trend === 'up' ? '#34d399' : entry.form_trend === 'down' ? '#f87171' : '#6b7280'

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[0.5px] border-white/[.05] last:border-0 group"
              >
                <Link href={`/horse/${entry.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <HorseIcon tier={tier} active={tier !== 'gray'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f2f2f2] truncate group-hover:text-white transition-colors">
                      {entry.name}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                      {[
                        entry.age != null ? `${entry.age} y.o.` : null,
                        entry.rider_name,
                        entry.rider_country ? getCountryFlag(entry.rider_country) : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </Link>

                {/* Right side: latest result */}
                <div className="text-right shrink-0 min-w-[60px]">
                  {entry.latest_place != null && (
                    <p className="text-xs font-medium tabular-nums" style={{ color: trendColor }}>
                      {entry.latest_place}{ordinal(entry.latest_place)}
                    </p>
                  )}
                  {entry.latest_comp && (
                    <p className="text-[10px] text-[#4b5563] truncate max-w-[80px]">{entry.latest_comp}</p>
                  )}
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); remove(entry.id) }}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-[#4b5563] hover:text-[#f2f2f2] hover:bg-white/[.06] transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove from stable"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
