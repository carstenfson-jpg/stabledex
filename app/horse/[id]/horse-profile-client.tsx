'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import PerformanceChart from '@/components/performance-chart'
import StrengthsRadar from '@/components/strengths-radar'
import WatchButton from '@/components/watch-button'
import { getCountryFlag, type HorseWithDetails } from '@/lib/types'
import type { Result, Competition, Rider } from '@/lib/types'

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
      className="flex items-center gap-1.5 text-xs text-[#4b5563] hover:text-[#9ca3af] transition-colors"
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
  // Feature 5: animated stat values
  const aFaults = useCountUp(stats.avgFaults ?? 0, 0)
  const aClear = useCountUp(stats.clearRoundPct ?? 0, 100)
  const aStarts = useCountUp(stats.totalStarts, 200)
  const aWin = useCountUp(stats.winRate ?? 0, 300)
  const aTop3 = useCountUp(stats.top3Rate ?? 0, 300)

  const statCards = [
    {
      label: 'Avg faults / round',
      value: stats.avgFaults != null ? aFaults.toFixed(1) : '—',
      sub: 'show jumping',
    },
    {
      label: 'Clear rounds',
      value: stats.clearRoundPct != null ? `${aClear.toFixed(0)}%` : '—',
      sub: 'of jumping rounds',
    },
    {
      label: 'Career starts',
      value: Math.round(aStarts).toString(),
      sub: 'total results',
    },
    {
      label: 'Win / Top 3',
      value: stats.winRate != null ? `${aWin.toFixed(0)}% / ${aTop3.toFixed(0)}%` : '—',
      sub: 'placement rate',
    },
  ]

  const chartResults = sortedResults.filter(
    (r) => r.competition?.discipline === 'Show Jumping' && r.faults != null
  ) as Parameters<typeof PerformanceChart>[0]['results']

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="flex items-start gap-4 mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[0.5px] border-white/[.08] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#4b5563]">
            <path d="M21 8c0 2.5-1.5 5-4 6.5V18a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.5C4.5 13 3 10.5 3 8c0-4 4-7 9-7s9 3 9 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-semibold text-[#f2f2f2]">{horse.name}</h1>
            <Badge>{horse.breed}</Badge>
            <Badge accent>{discipline}</Badge>
            {horse.country && <span className="text-sm text-[#6b7280]">{getCountryFlag(horse.country)} {horse.country}</span>}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#6b7280]">
              {horse.gender}
              {stats.age ? ` · ${stats.age} years old` : ''}
              {horse.current_rider && <span className="ml-2 text-[#9ca3af]">· {horse.current_rider.name}</span>}
            </p>
            <CopyLinkButton />
            <WatchButton horseId={horse.id} />
          </div>
        </div>
      </motion.div>

      {/* Stats cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.09 }}
            className="border border-[0.5px] border-white/[.07] rounded-xl p-4 bg-[#1a1a1a]"
          >
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-2">{card.label}</p>
            <p className="text-2xl font-semibold text-[#f2f2f2] tabular-nums">{card.value}</p>
            <p className="text-[10px] text-[#4b5563] mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Details */}
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

      {/* Strengths radar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }} className="mb-6">
        <StrengthsRadar values={stats.strengthValues} />
      </motion.div>

      {/* Feature 11: Career timeline */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}>
        <Timeline results={sortedResults} />
      </motion.div>

      {/* Results table */}
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
  )
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] border border-[0.5px] ${
      accent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
    }`}>{children}</span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-[#4b5563] shrink-0">{label}</dt>
      <dd className="text-xs text-[#f2f2f2] text-right truncate">{value}</dd>
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
