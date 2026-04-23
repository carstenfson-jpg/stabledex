import { createClient } from '@/lib/supabase/server'
import { getDominantDiscipline, getBestLevel, LEVEL_ORDER, type HorseWithDetails, type Discipline } from '@/lib/types'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

const AXES = ['Consistency', 'Win rate', 'Top 3', 'Level', 'Experience', 'Form']
const AXIS_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']

function computeStrengths(horse: HorseWithDetails): number[] {
  const jumping = horse.results.filter((r) => r.competition?.discipline === 'Show Jumping' && r.faults != null)
  const clears = jumping.filter((r) => r.faults === 0).length
  const total = horse.results.length
  const placements = horse.results.map((r) => r.placement).filter((p): p is number => p != null)
  const wins = placements.filter((p) => p === 1).length
  const top3 = placements.filter((p) => p <= 3).length
  const levels = horse.results.map((r) => r.competition?.level).filter(Boolean) as string[]
  const bestLevel = levels.length > 0 ? getBestLevel(levels) : null
  const bestScore = bestLevel ? (LEVEL_ORDER[bestLevel] ?? 0) : 0
  const sorted = [...horse.results].sort((a, b) => (b.competition?.date ?? '').localeCompare(a.competition?.date ?? ''))
  const last5 = sorted.slice(0, 5).map((r) => r.placement).filter((p): p is number => p != null)
  const avgLast5 = last5.length > 0 ? last5.reduce((a, b) => a + b, 0) / last5.length : null
  return [
    jumping.length > 0 ? Math.round((clears / jumping.length) * 100) : 0,
    total > 0 ? Math.min(Math.round((wins / total) * 5 * 100), 100) : 0,
    total > 0 ? Math.min(Math.round((top3 / total) * 2.5 * 100), 100) : 0,
    Math.round((bestScore / 5) * 100),
    Math.min(Math.round((total / 60) * 100), 100),
    avgLast5 != null ? Math.round(Math.max(0, 1 - (avgLast5 - 1) / 10) * 100) : 0,
  ]
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { ids = '' } = await searchParams
  const horseIds = ids.split(',').filter(Boolean).slice(0, 3)

  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('horses')
    .select(`id, name, breed, country, gender, date_of_birth, current_rider_id,
      current_rider:riders!current_rider_id(id, name, country, fei_id),
      results(id, placement, faults, time, class_name, score, created_at,
        rider:riders(id, name, country, fei_id),
        competition:competitions(id, name, level, discipline, date, location, country))`)
    .in('id', horseIds)

  const horses = (raw ?? []) as unknown as HorseWithDetails[]
  const strengths = horses.map(computeStrengths)

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-[#4b5563] hover:text-[#6b7280] transition-colors text-sm">← Back</Link>
        <h1 className="text-2xl font-semibold text-[#f2f2f2]">Compare horses</h1>
      </div>

      {/* Horse headers */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${horses.length}, 1fr)` }}>
        {horses.map((h) => (
          <div key={h.id} className="border border-[0.5px] border-white/[.07] rounded-xl p-4 bg-[#1a1a1a]">
            <Link href={`/horse/${h.id}`} className="text-sm font-semibold text-[#f2f2f2] hover:text-white transition-colors block truncate">{h.name}</Link>
            <p className="text-xs text-[#4b5563] mt-0.5">{h.breed} · {h.current_rider?.name ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Strength comparison table */}
      <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
        <div className="px-4 py-2.5 border-b border-[0.5px] border-white/[.07]">
          <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium">Strengths comparison</p>
        </div>
        {AXES.map((axis, ai) => (
          <div key={axis} className="px-4 py-3 border-b border-[0.5px] border-white/[.05] last:border-0">
            <p className="text-xs text-[#6b7280] mb-2">{axis}</p>
            <div className="flex flex-col gap-1.5">
              {horses.map((h, hi) => {
                const v = strengths[hi]?.[ai] ?? 0
                const color = v > 70 ? '#22c55e' : v > 40 ? '#6b7280' : '#374151'
                return (
                  <div key={h.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4b5563] w-28 truncate shrink-0">{h.name}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/[.05] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[10px] tabular-nums w-7 text-right" style={{ color }}>{v}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
