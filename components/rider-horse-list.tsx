'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getBestLevel, getCountryFlag, LEVEL_ORDER } from '@/lib/types'
import { getHorseTier, HorseIcon } from '@/components/horse-icon'

type SortKey = 'level' | 'name' | 'age'

interface Horse {
  id: string
  name: string
  breed: string
  date_of_birth: string | null
  country: string
  results: Array<{ competition: { level: string; discipline: string } | null }>
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'level', label: 'Best level' },
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
]

function sortHorses(horses: Horse[], key: SortKey): Horse[] {
  return [...horses].sort((a, b) => {
    if (key === 'level') {
      const levA = a.results.map((r) => r.competition?.level).filter((l): l is string => Boolean(l))
      const levB = b.results.map((r) => r.competition?.level).filter((l): l is string => Boolean(l))
      const bestA = levA.length > 0 ? getBestLevel(levA) : null
      const bestB = levB.length > 0 ? getBestLevel(levB) : null
      return (LEVEL_ORDER[bestB ?? ''] ?? 0) - (LEVEL_ORDER[bestA ?? ''] ?? 0)
    }
    if (key === 'name') return a.name.localeCompare(b.name)
    if (key === 'age') {
      const ageA = a.date_of_birth ? new Date(a.date_of_birth).getTime() : 0
      const ageB = b.date_of_birth ? new Date(b.date_of_birth).getTime() : 0
      return ageA - ageB // oldest first (smallest timestamp = born earlier)
    }
    return 0
  })
}

export default function RiderHorseList({ horses }: { horses: Horse[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('level')
  const sorted = sortHorses(horses, sortKey)

  return (
    <>
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
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

      {horses.length === 0 ? (
        <p className="text-sm text-[#4b5563]">No horses registered for this rider.</p>
      ) : (
        <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
          {sorted.map((horse) => {
            const levels = horse.results
              .map((r) => r.competition?.level)
              .filter((l): l is string => Boolean(l))
            const bestLevel = levels.length > 0 ? getBestLevel(levels) : null
            const tier = getHorseTier(bestLevel)

            const age = horse.date_of_birth
              ? Math.floor(
                  (Date.now() - new Date(horse.date_of_birth).getTime()) /
                    (1000 * 60 * 60 * 24 * 365.25)
                )
              : null

            const meta = [horse.breed, age != null ? `${age} y.o.` : null, horse.country ? getCountryFlag(horse.country) : null]
              .filter(Boolean)
              .join(' · ')

            return (
              <Link
                key={horse.id}
                href={`/horse/${horse.id}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[.04] transition-colors border-b border-[0.5px] border-white/[.05] last:border-0"
              >
                <HorseIcon tier={tier} active={tier !== 'gray'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f2f2f2] truncate">{horse.name}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5 truncate">{meta}</p>
                </div>
                {bestLevel && (
                  <span className="shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] border border-[0.5px] bg-white/[.04] border-white/[.08] text-[#6b7280]">
                    {bestLevel}
                  </span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4b5563] shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
