import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import RankingsTabs from './rankings-tabs'
import type { RankingRow } from '@/lib/types'
import { getCountryFlag } from '@/lib/types'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

function periodToDate(period: string): string {
  const now = new Date()
  const prev = period.endsWith('_prev')
  const base = period.replace('_prev', '')
  const days = base === '30d' ? 30 : base === '90d' ? 90 : base === '180d' ? 180 : null
  if (!days) return prev ? '2024-01-01' : '2025-01-01'
  now.setDate(now.getDate() - (prev ? days * 2 : days))
  return now.toISOString().slice(0, 10)
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const period = params.period ?? '90d'
  const discipline = params.discipline ?? ''
  const level = params.level ?? ''
  const country = params.country ?? ''

  const supabase = await createClient()
  const fromDate = periodToDate(period)

  const [{ data: rankings }, { data: prevRankings }] = await Promise.all([
    supabase.rpc('get_rankings', { p_from: fromDate, p_discipline: discipline, p_level: level, p_country: country }),
    supabase.rpc('get_rankings', { p_from: periodToDate(period + '_prev'), p_discipline: discipline, p_level: level, p_country: country }),
  ])

  const rows = (rankings ?? []) as RankingRow[]
  const prevRows = (prevRankings ?? []) as RankingRow[]
  const prevRankMap = new Map(prevRows.map((r, i) => [r.horse_id, i + 1]))

  // Live: horses competing in the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { data: recentComps } = await supabase
    .from('results')
    .select('horse_id, competition:competitions(date)')
    .gte('competition.date', sevenDaysAgo.toISOString().slice(0, 10))

  const liveHorseIds = new Set(
    ((recentComps ?? []) as unknown as Array<{ horse_id: string; competition: { date: string } | null }>)
      .filter((r) => r.competition)
      .map((r) => r.horse_id)
  )
  const liveCount = rows.filter((r) => liveHorseIds.has(r.horse_id)).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#f2f2f2]">Rankings</h1>
        {liveCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/[.08] border border-[0.5px] border-emerald-500/20 rounded-full px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {liveCount} competing now
          </span>
        )}
      </div>

      {/* Period tabs + filter row (client component) */}
      <Suspense>
        <RankingsTabs period={period} />
      </Suspense>

      {/* Rankings list */}
      <div className="mt-8 border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
        {rows.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-[#4b5563]">
            No results for this period.
          </div>
        ) : (
          rows.map((row, i) => {
            const prevRank = prevRankMap.get(row.horse_id)
            const movement = prevRank != null ? prevRank - (i + 1) : null
            const isLive = liveHorseIds.has(row.horse_id)
            return <RankingCard key={`${row.horse_id}-${row.discipline}`} row={row} rank={i + 1} movement={movement} isLive={isLive} />
          })
        )}
      </div>
    </div>
  )
}

function RankingCard({ row, rank, movement, isLive }: { row: RankingRow; rank: number; movement: number | null; isLive: boolean }) {
  return (
    <Link href={`/horse/${row.horse_id}`}>
      <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[.03] transition-colors border-b border-[0.5px] border-white/[.06] last:border-0 cursor-pointer">
        <div className="w-7 shrink-0 flex items-center gap-1">
          <span className="text-sm text-[#4b5563] tabular-nums">{rank}</span>
          {movement != null && movement !== 0 && (
            <span className={`text-[9px] font-medium ${movement > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {movement > 0 ? `↑${movement}` : `↓${Math.abs(movement)}`}
            </span>
          )}
        </div>
        {isLive && (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#f2f2f2]">{row.horse_name}</span>
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] bg-white/[.04] border border-[0.5px] border-white/[.08] text-[#6b7280]">
              {row.breed}
            </span>
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] bg-emerald-500/10 border border-[0.5px] border-emerald-500/20 text-emerald-400">
              {row.discipline}
            </span>
            {row.best_level && (
              <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] bg-white/[.04] border border-[0.5px] border-white/[.08] text-[#6b7280]">
                {row.best_level}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6b7280] mt-0.5">
            {row.rider_name}
            {row.rider_country && (
              <span className="ml-1.5">
                {getCountryFlag(row.rider_country)} {row.rider_country}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="hidden sm:block"><Stat label="Wins" value={row.wins.toString()} /></div>
          <div className="hidden sm:block"><Stat label="Top 3" value={row.top3.toString()} /></div>
          <div className="hidden sm:block"><Stat label="Starts" value={row.starts.toString()} /></div>
          <Stat label="Points" value={row.points.toString()} highlight />
        </div>
      </div>
    </Link>
  )
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="text-right">
      <p
        className={`text-sm font-medium tabular-nums ${highlight ? 'text-[#f2f2f2]' : 'text-[#9ca3af]'}`}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-[#4b5563]">{label}</p>
    </div>
  )
}
