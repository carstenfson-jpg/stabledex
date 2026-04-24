'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import PerformanceChart from '@/components/performance-chart'
import StrengthsRadar from '@/components/strengths-radar'
import WatchButton from '@/components/watch-button'
import { getCountryFlag, getBestLevel, LEVEL_ORDER, type HorseWithDetails } from '@/lib/types'
import type { Result, Competition, Rider } from '@/lib/types'
import { getHorseTier, HorseIcon } from '@/components/horse-icon'
import AddToStableButton from '@/components/add-to-stable-button'
import BackButton from '@/components/back-button'

type ResultRow = Result & { rider: Rider; competition: Competition }

interface HorseStats {
  avgFaults: number | null
  clearRoundPct: number | null
  totalStarts: number
  winRate: number | null
  top3Rate: number | null
  bestPlacement: number | null
  bestLevel: string | null
  age: number | null
  strengthValues: number[]
}

interface Props {
  horse: HorseWithDetails
  stats: HorseStats
  discipline: string
  sortedResults: ResultRow[]
}

// ── Level filter stats recomputation ─────────────────────────────────────────
function computeFilteredStats(results: ResultRow[]) {
  const jumping = results.filter((r) => r.competition?.discipline === 'Show Jumping' && r.faults != null)
  const totalFaults = jumping.reduce((s, r) => s + (r.faults ?? 0), 0)
  const avgFaults = jumping.length > 0 ? totalFaults / jumping.length : null
  const clearRounds = jumping.filter((r) => r.faults === 0).length
  const clearRoundPct = jumping.length > 0 ? (clearRounds / jumping.length) * 100 : null
  const totalStarts = results.length
  const placements = results.map((r) => r.placement).filter((p): p is number => p != null)
  const wins = placements.filter((p) => p === 1).length
  const top3 = placements.filter((p) => p <= 3).length
  const winRate = totalStarts > 0 ? (wins / totalStarts) * 100 : null
  const top3Rate = totalStarts > 0 ? (top3 / totalStarts) * 100 : null
  return { avgFaults, clearRoundPct, totalStarts, winRate, top3Rate }
}

// ── Feature 5: animated number hook ──────────────────────────────────────────
function useCountUp(target: number, delay = 0, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf: number
    const timeout = setTimeout(() => {
      const start = performance.now()
      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1)
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        setVal(eased * target)
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf) }
  }, [target, delay, duration])
  return val
}

// ── Feature 9: copy link button ───────────────────────────────────────────────
function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-[#4b5563] hover:text-[#9ca3af] transition-colors whitespace-nowrap"
    >
      {copied ? (
        <span className="text-emerald-400">✓ Copied</span>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy link
        </>
      )}
    </button>
  )
}

// ── Level filter dropdown ─────────────────────────────────────────────────────
function LevelFilter({ levels, value, onChange }: { levels: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const label = value === 'all' ? 'All competitions' : value

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[0.5px] border-white/[.08] bg-white/[.03] hover:bg-white/[.06] text-[10px] text-[#6b7280] hover:text-[#9ca3af] transition-colors"
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[0.5px] border-white/[.1] bg-[#1a1a1a] shadow-xl z-50 py-1 overflow-hidden">
          {['all', ...levels].map((lvl) => (
            <button
              key={lvl}
              onClick={() => { onChange(lvl); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                value === lvl ? 'text-[#f2f2f2] bg-white/[.06]' : 'text-[#6b7280] hover:text-[#9ca3af] hover:bg-white/[.03]'
              }`}
            >
              {lvl === 'all' ? 'All competitions' : lvl}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Feature 11: career timeline ───────────────────────────────────────────────
function Timeline({ results }: { results: ResultRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const recent = results.slice(0, 8)

  function dotColor(r: ResultRow) {
    if (r.placement === 1) return '#fbbf24'
    if (r.placement != null && r.placement <= 3) return '#22c55e'
    if (r.faults != null && r.faults >= 8) return '#ef4444'
    if (r.faults === 0) return '#22c55e'
    return '#374151'
  }

  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-4">Career timeline</p>
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[.06]" />
        {recent.map((r, i) => {
          const isOpen = expanded === r.id
          const color = dotColor(r)
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.22 }}
              className="relative mb-1"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="flex items-center gap-3 w-full text-left py-1.5 group"
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 shrink-0 -ml-4 relative z-10"
                  style={{ borderColor: color, backgroundColor: color + '33', boxShadow: isOpen ? `0 0 6px ${color}66` : 'none' }} />
                <span className="text-xs text-[#6b7280] tabular-nums w-20 shrink-0">
                  {r.competition?.date ? new Date(r.competition.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                </span>
                <span className="text-xs text-[#9ca3af] truncate group-hover:text-[#f2f2f2] transition-colors">
                  {r.competition?.name ?? '—'}
                </span>
              </button>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mb-1 px-3 py-2 rounded-lg bg-white/[.03] border border-[0.5px] border-white/[.07]"
                >
                  <div className="flex gap-4 text-xs text-[#6b7280]">
                    <span>{r.competition?.level ?? '—'}</span>
                    {r.faults != null && <span>{r.faults} faults</span>}
                    {r.placement != null && <span>{ordinal(r.placement)}</span>}
                    {r.score != null && <span>{r.score.toFixed(3)}%</span>}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function HorseProfileClient({ horse, stats, discipline, sortedResults }: Props) {
  const [tab, setTab] = useState<'stats' | 'results' | 'strengths'>('stats')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  // Unique competition levels present in this horse's results, best → worst
  const uniqueLevels = Array.from(
    new Set(sortedResults.map((r) => r.competition?.level).filter(Boolean) as string[])
  ).sort((a, b) => (LEVEL_ORDER[b] ?? 0) - (LEVEL_ORDER[a] ?? 0))

  const filteredResults = levelFilter === 'all'
    ? sortedResults
    : sortedResults.filter((r) => r.competition?.level === levelFilter)

  const dynStats = levelFilter === 'all'
    ? { avgFaults: stats.avgFaults, clearRoundPct: stats.clearRoundPct, totalStarts: stats.totalStarts, winRate: stats.winRate, top3Rate: stats.top3Rate }
    : computeFilteredStats(filteredResults)

  // Feature 5: animated stat values (re-animate on filter change)
  const aFaults = useCountUp(dynStats.avgFaults ?? 0, 0)
  const aClear = useCountUp(dynStats.clearRoundPct ?? 0, 100)
  const aStarts = useCountUp(dynStats.totalStarts, 200)
  const aWin = useCountUp(dynStats.winRate ?? 0, 300)
  const aTop3 = useCountUp(dynStats.top3Rate ?? 0, 300)

  const statCards = [
    {
      label: 'Avg faults / round',
      value: dynStats.avgFaults != null ? aFaults.toFixed(1) : '—',
      sub: 'show jumping',
      tooltip: 'Average faults per show jumping round across all starts. Lower is better — 0 means a clear round.',
    },
    {
      label: 'Clear rounds',
      value: dynStats.clearRoundPct != null ? `${aClear.toFixed(0)}%` : '—',
      sub: 'of jumping rounds',
      tooltip: 'Percentage of show jumping rounds completed with zero faults.',
    },
    {
      label: 'Career starts',
      value: Math.round(aStarts).toString(),
      sub: 'total results',
      tooltip: 'Total number of recorded competition results across all disciplines and levels.',
    },
    {
      label: 'Win / Top 3',
      value: dynStats.winRate != null ? `${aWin.toFixed(0)}% / ${aTop3.toFixed(0)}%` : '—',
      sub: 'placement rate',
      tooltip: 'Win rate: % of starts finishing 1st. Top 3 rate: % finishing in the top 3 places.',
    },
  ]

  const chartResults = filteredResults.filter(
    (r) => r.competition?.discipline === 'Show Jumping' && r.faults != null
  ) as Parameters<typeof PerformanceChart>[0]['results']

  const recentPlacements = sortedResults.slice(0, 5).map((r) => r.placement).filter((p): p is number => p != null)
  const olderPlacements = sortedResults.slice(5, 10).map((r) => r.placement).filter((p): p is number => p != null)
  const avgRecent = recentPlacements.length > 0 ? recentPlacements.reduce((a, b) => a + b, 0) / recentPlacements.length : null
  const avgOlder = olderPlacements.length > 0 ? olderPlacements.reduce((a, b) => a + b, 0) / olderPlacements.length : null
  const formTrend: 'up' | 'down' | 'flat' =
    avgRecent != null && avgOlder != null
      ? avgRecent < avgOlder ? 'up' : avgRecent > avgOlder ? 'down' : 'flat'
      : 'flat'

  const stableEntry = {
    id: horse.id,
    name: horse.name,
    breed: horse.breed,
    age: stats.age,
    best_level: stats.bestLevel,
    rider_name: horse.current_rider?.name ?? '',
    rider_country: horse.current_rider?.country ?? '',
    latest_place: sortedResults[0]?.placement ?? null,
    latest_comp: sortedResults[0]?.competition?.name ?? '',
    form_trend: formTrend,
    added_at: new Date().toISOString(),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <BackButton />
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="flex items-start gap-4 mb-8"
      >
        <HorseIcon tier={getHorseTier(stats.bestLevel)} active boxSize={48} size={22} radius={12} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-semibold text-[#f2f2f2]">{horse.name}</h1>
            <Badge>{horse.breed}</Badge>
            <Badge accent>{discipline}</Badge>
            {horse.country && <span className="text-sm text-[#6b7280]">{getCountryFlag(horse.country)} {horse.country}</span>}
          </div>
          <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
            <p className="text-sm text-[#6b7280]">
              {horse.gender}
              {stats.age ? ` · ${stats.age} years old` : ''}
              {horse.current_rider && (
                <>
                  {' · '}
                  <Link href={`/rider/${horse.current_rider.id}`} className="text-[#f2f2f2] underline underline-offset-2 decoration-white/20 hover:decoration-white/60 transition-all whitespace-nowrap">
                    {horse.current_rider.name}
                  </Link>
                </>
              )}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <CopyLinkButton />
              <WatchButton horseId={horse.id} />
              <AddToStableButton entry={stableEntry} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile tab bar */}
      <div className="flex border-b border-white/[.07] mb-6 sm:hidden -mx-4 px-4">
        {(['stats', 'results', 'strengths'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 h-10 text-xs capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-emerald-500 text-[#f2f2f2]' : 'border-transparent text-[#6b7280]'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* ── MOBILE: one section at a time via React conditional rendering ────── */}
      <div className="sm:hidden">
        {tab === 'stats' && (
          <>
            <div className="flex justify-end mb-3">
              <LevelFilter levels={uniqueLevels} value={levelFilter} onChange={setLevelFilter} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {statCards.map((card) => (
                <div key={card.label} className="border border-[0.5px] border-white/[.07] rounded-xl p-4 bg-[#1a1a1a]">
                  <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-2">{card.label}</p>
                  <p className="text-xl font-semibold text-[#f2f2f2] tabular-nums">{card.value}</p>
                  <p className="text-[10px] text-[#4b5563] mt-1">{card.sub}</p>
                </div>
              ))}
            </div>
            <div className="border border-[0.5px] border-white/[.07] rounded-xl p-4 bg-[#1a1a1a] mb-4">
              <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-4">Performance</p>
              <PerformanceChart results={chartResults} />
            </div>
            <div className="border border-[0.5px] border-white/[.07] rounded-xl p-4 bg-[#1a1a1a]">
              <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Details</p>
              <dl className="flex flex-col gap-3">
                <Row label="Born" value={horse.date_of_birth ? new Date(horse.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
                <Row label="Gender" value={horse.gender ?? '—'} />
                <Row label="Sire" value={horse.sire ?? '—'} />
                <Row label="Dam" value={horse.dam ?? '—'} />
                <Row label="Rider" value={horse.current_rider?.name ?? '—'} href={horse.current_rider ? `/rider/${horse.current_rider.id}` : undefined} />
                <Row label="Owner" value={horse.owner ?? '—'} />
                <Row label="Best level" value={stats.bestLevel ?? '—'} />
              </dl>
            </div>
            <AchievementsSection results={sortedResults} />
          </>
        )}
        {tab === 'strengths' && (
          <StrengthsRadar values={stats.strengthValues} />
        )}
        {tab === 'results' && (
          <>
            <Timeline results={sortedResults} />
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-[#f2f2f2]">
                Competition results
                <span className="ml-2 text-xs text-[#4b5563] font-normal">{stats.totalStarts} starts</span>
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {sortedResults.map((r) => (
                <div key={r.id} className="rounded-lg px-3 py-3 bg-[#1a1a1a] border border-[0.5px] border-white/[.07]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#f2f2f2] truncate">{r.competition?.name ?? '—'}</p>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">
                        {r.competition?.date ? new Date(r.competition.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {r.placement != null && <p className={`text-xs font-medium ${r.placement <= 3 ? 'text-emerald-400' : 'text-[#f2f2f2]'}`}>{ordinal(r.placement)}</p>}
                      {r.faults != null && <p className={`text-xs ${r.faults === 0 ? 'text-emerald-400' : r.faults < 8 ? 'text-[#9ca3af]' : 'text-red-400'}`}>{r.faults} faults</p>}
                    </div>
                  </div>
                  {r.competition?.level && (
                    <span className="mt-2 inline-flex items-center h-4 px-1.5 rounded-full text-[9px] bg-white/[.04] border border-[0.5px] border-white/[.08] text-[#6b7280]">{r.competition.level}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── DESKTOP: all sections always visible ─────────────────────────────── */}
      <div className="hidden sm:block">
        {/* Stats cards row */}
        <div className="flex justify-end mb-3">
          <LevelFilter levels={uniqueLevels} value={levelFilter} onChange={setLevelFilter} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.09 }}
              className="relative group border border-[0.5px] border-white/[.07] rounded-xl p-4 bg-[#1a1a1a]"
            >
              <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-2">{card.label}</p>
              <p className="text-2xl font-semibold text-[#f2f2f2] tabular-nums">{card.value}</p>
              <p className="text-[10px] text-[#4b5563] mt-1">{card.sub}</p>
              <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 px-3 py-2 rounded-lg bg-[#222] border border-white/[.1] text-[11px] text-[#9ca3af] leading-relaxed opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 delay-200 z-50 shadow-xl">
                {card.tooltip}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#222]" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.38 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="md:col-span-2 border border-[0.5px] border-white/[.07] rounded-xl p-5 bg-[#1a1a1a]">
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-4">Performance</p>
            <PerformanceChart results={chartResults} />
          </div>
          <div className="border border-[0.5px] border-white/[.07] rounded-xl p-5 bg-[#1a1a1a]">
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-4">Details</p>
            <dl className="flex flex-col gap-3">
              <Row label="Studbook" value={horse.studbook_number ?? '—'} />
              <Row label="Born" value={horse.date_of_birth ? new Date(horse.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
              <Row label="Gender" value={horse.gender ?? '—'} />
              <Row label="Sire" value={horse.sire ?? '—'} />
              <Row label="Dam" value={horse.dam ?? '—'} />
              <Row label="Rider" value={horse.current_rider?.name ?? '—'} />
              <Row label="Owner" value={horse.owner ?? '—'} />
              <Row label="Best level" value={stats.bestLevel ?? '—'} />
            </dl>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }} className="mb-6">
          <StrengthsRadar values={stats.strengthValues} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.48 }} className="mb-6">
          <AchievementsSection results={sortedResults} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}>
          <Timeline results={sortedResults} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.55 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[#f2f2f2]">
              Competition results
              <span className="ml-2 text-xs text-[#4b5563] font-normal">{stats.totalStarts} starts</span>
            </h2>
          </div>
          <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden bg-[#1a1a1a]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[0.5px] border-white/[.07]">
                    <Th>Date</Th><Th>Competition</Th><Th>Level</Th><Th>Faults</Th><Th>Result</Th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-[#4b5563]">No results.</td></tr>
                  ) : (
                    sortedResults.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(i, 12) * 0.03 + 0.55 }}
                        className="border-t border-[0.5px] border-white/[.05] hover:bg-white/[.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-[#6b7280] whitespace-nowrap tabular-nums">
                          {r.competition?.date ? new Date(r.competition.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#f2f2f2] whitespace-nowrap">{r.competition?.name ?? '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] bg-white/[.04] border border-[0.5px] border-white/[.08] text-[#6b7280]">
                            {r.competition?.level ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium tabular-nums whitespace-nowrap">
                          {r.faults != null ? (
                            <span className={r.faults === 0 ? 'text-emerald-400' : r.faults < 8 ? 'text-[#9ca3af]' : 'text-red-400'}>{r.faults}</span>
                          ) : r.score != null ? (
                            <span className="text-[#9ca3af]">{r.score.toFixed(3)}%</span>
                          ) : (
                            <span className="text-[#4b5563]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium tabular-nums whitespace-nowrap">
                          {r.placement ? (
                            <span className={r.placement <= 3 ? 'text-emerald-400' : 'text-[#f2f2f2]'}>{ordinal(r.placement)}</span>
                          ) : (
                            <span className="text-[#4b5563]">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

// ── Achievements ─────────────────────────────────────────────────────────────

const GP_LEVELS = new Set(['CSI5*', 'GP', 'CDIO5*', 'CDI5*', 'CDIO', 'CCI4*'])

interface Achievement {
  id: string
  title: string
  description: string
  iconType: 'trophy' | 'star' | 'zap' | 'shield' | 'globe'
  iconBg: string
  unlockedAt: string | null
}

function computeAchievements(results: ResultRow[]): Achievement[] {
  const byDate = [...results]
    .filter((r) => r.competition?.date)
    .sort((a, b) => a.competition!.date.localeCompare(b.competition!.date))

  const firstWin = byDate.find((r) => r.placement === 1)
  const gpDebut = byDate.find((r) => GP_LEVELS.has(r.competition?.level ?? ''))

  const sjByDate = byDate.filter(
    (r) => r.competition?.discipline === 'Show Jumping' && r.faults != null
  )
  let cleanStreakDate: string | null = null
  let streak = 0
  for (const r of sjByDate) {
    if ((r.faults ?? 1) === 0) {
      streak++
      if (streak >= 5) { cleanStreakDate = r.competition!.date; break }
    } else { streak = 0 }
  }

  const veteranDate = byDate[49]?.competition?.date ?? null

  const seen = new Set<string>()
  let internationalDate: string | null = null
  for (const r of byDate) {
    const c = r.competition?.country
    if (c) {
      seen.add(c)
      if (seen.size >= 5 && !internationalDate) internationalDate = r.competition!.date
    }
  }

  return [
    { id: 'first-win', title: 'First Win',
      description: firstWin ? `1st place at ${firstWin.competition?.level ?? 'competition'}` : '1st place finish',
      iconType: 'trophy', iconBg: '#78350f', unlockedAt: firstWin?.competition?.date ?? null },
    { id: 'gp-debut', title: 'GP Debut',
      description: 'First CSI5* / GP result',
      iconType: 'star', iconBg: '#1e3a5f', unlockedAt: gpDebut?.competition?.date ?? null },
    { id: 'clean-streak', title: 'Clean Streak',
      description: '5 consecutive clear rounds',
      iconType: 'zap', iconBg: '#064e3b', unlockedAt: cleanStreakDate },
    { id: 'veteran', title: 'Veteran',
      description: '50+ career starts',
      iconType: 'shield', iconBg: '#1e293b', unlockedAt: veteranDate },
    { id: 'international', title: 'International',
      description: 'Competed in 5+ countries',
      iconType: 'globe', iconBg: '#1a2e1a', unlockedAt: internationalDate },
  ]
}

function AchievementIcon({ type }: { type: Achievement['iconType'] }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'trophy') return <svg {...props}><path d="M6 9H3V4h18v5h-3"/><path d="M12 15v3"/><path d="M8 18h8"/><path d="M6 9a6 6 0 0012 0"/></svg>
  if (type === 'star') return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (type === 'zap') return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  if (type === 'shield') return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
}

function AchievementsSection({ results }: { results: ResultRow[] }) {
  const achievements = computeAchievements(results)
  const unlocked = achievements.filter((a) => a.unlockedAt !== null)
  const locked = achievements.filter((a) => a.unlockedAt === null)
  const ordered = [...unlocked, ...locked]

  return (
    <div className="border border-[0.5px] border-white/[.07] rounded-xl bg-[#1a1a1a] overflow-hidden">
      <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium px-4 pt-4 pb-3">
        Achievements
      </p>
      <div className="flex flex-col">
        {ordered.map((a, i) => {
          const isUnlocked = a.unlockedAt !== null
          const date = a.unlockedAt
            ? new Date(a.unlockedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
            : null
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3.5 px-4 py-3 ${i < ordered.length - 1 ? 'border-b border-[0.5px] border-white/[.05]' : ''}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: isUnlocked ? a.iconBg : 'rgba(255,255,255,0.04)' }}
              >
                {isUnlocked ? (
                  <span className="text-white/90"><AchievementIcon type={a.iconType} /></span>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4b5563]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isUnlocked ? 'text-[#f2f2f2]' : 'text-[#4b5563]'}`}>{a.title}</p>
                <p className={`text-[11px] mt-0.5 ${isUnlocked ? 'text-[#6b7280]' : 'text-[#374151]'}`}>{a.description}</p>
              </div>
              {date && <p className="text-[11px] text-[#4b5563] shrink-0 tabular-nums">{date}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] border border-[0.5px] ${
      accent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
    }`}>{children}</span>
  )
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-[#4b5563] shrink-0">{label}</dt>
      <dd className="text-xs text-[#f2f2f2] text-right truncate">
        {href ? (
          <Link href={href} className="underline underline-offset-2 decoration-white/20 hover:decoration-white/60 transition-all">{value}</Link>
        ) : value}
      </dd>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-medium text-[#4b5563] whitespace-nowrap">{children}</th>
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
