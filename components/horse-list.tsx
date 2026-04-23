'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { motion } from 'framer-motion'
import HorseCard from './horse-card'
import { getDominantDiscipline, getBestLevel, type HorseWithDetails, type Discipline } from '@/lib/types'
import { getHorseTier } from './horse-icon'

interface HorseListProps {
  horses: HorseWithDetails[]
  total: number
}

const SORT_OPTIONS = [
  { label: 'FEI ranking', value: 'ranking' },
  { label: 'Recent results', value: 'recent' },
  { label: 'Name', value: 'name' },
]

export default function HorseList({ horses, total }: HorseListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') ?? 'ranking'

  const setSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', value)
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6b7280]">
          <span className="text-[#f2f2f2] font-medium">{total.toLocaleString()}</span>{' '}
          {total === 1 ? 'horse' : 'horses'}
        </p>
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`h-7 px-3 rounded-md text-xs transition-colors ${
                sort === opt.value
                  ? 'bg-white/[.08] text-[#f2f2f2]'
                  : 'text-[#6b7280] hover:text-[#9ca3af]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
        {horses.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#4b5563]">
            No horses found.
          </div>
        ) : (
          horses.map((horse, i) => {
            const disciplines = horse.results
              .map((r) => r.competition?.discipline)
              .filter(Boolean) as Discipline[]
            const discipline =
              disciplines.length > 0 ? getDominantDiscipline(disciplines) : 'Show Jumping'

            const levels = horse.results
              .map((r) => r.competition?.level)
              .filter(Boolean) as string[]
            const bestLevel = levels.length > 0 ? getBestLevel(levels) : '—'

            const riderName = horse.current_rider?.name ?? '—'
            const riderCountry = horse.current_rider?.country ?? ''

            const { stat, statLabel } = getStat(horse, discipline)

            const tier = getHorseTier(levels.length > 0 ? bestLevel : null)

            const sparkline = horse.results
              .filter((r) => r.competition?.discipline === 'Show Jumping' && r.faults != null)
              .sort((a, b) => (a.competition?.date ?? '').localeCompare(b.competition?.date ?? ''))
              .slice(-7)
              .map((r) => r.faults as number)

            return (
              <motion.div
                key={horse.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(0.32 + i * 0.05, 0.7) }}
              >
                <HorseCard
                  rank={i + 1}
                  id={horse.id}
                  name={horse.name}
                  breed={horse.breed}
                  discipline={discipline}
                  riderName={riderName}
                  riderCountry={riderCountry}
                  stat={stat}
                  statLabel={statLabel}
                  tier={tier}
                  sparkline={sparkline}
                />
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

function getStat(
  horse: HorseWithDetails,
  discipline: string
): { stat: string; statLabel: string } {
  const results = horse.results ?? []
  if (results.length === 0) return { stat: '—', statLabel: 'no results' }

  if (discipline === 'Dressage') {
    const scores = results.map((r) => r.score).filter((s): s is number => s != null)
    if (scores.length === 0) return { stat: '—', statLabel: 'score' }
    const best = Math.max(...scores)
    return { stat: `${best.toFixed(3)}%`, statLabel: 'best score' }
  }

  // Show Jumping
  const clears = results.filter(
    (r) => r.faults != null && r.faults === 0
  ).length
  const total = results.length
  return {
    stat: `${clears}/${total}`,
    statLabel: 'clear rounds',
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function HorseListSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-[0.5px] border-white/[.06] last:border-0"
          >
            <div className="skeleton w-5 h-3.5 shrink-0" />
            <div className="skeleton w-9 h-9 rounded-lg shrink-0" style={{ borderRadius: 8 }} />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="skeleton h-3.5 w-36" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="skeleton h-3.5 w-10" />
              <div className="skeleton h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
