'use client'

import { useState, useMemo } from 'react'
import type { Result, Competition, Rider } from '@/lib/types'

type ResultRow = Result & {
  rider: Rider
  competition: Competition
}

interface ResultsTableProps {
  results: ResultRow[]
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<'date' | 'level' | 'placement'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [yearFilter, setYearFilter] = useState('')
  const [disciplineFilter, setDisciplineFilter] = useState('')

  const years = useMemo(() => {
    const s = new Set(results.map((r) => r.competition?.date?.slice(0, 4)).filter(Boolean))
    return [...s].sort().reverse()
  }, [results])

  const disciplines = useMemo(() => {
    const s = new Set(results.map((r) => r.competition?.discipline).filter(Boolean))
    return [...s]
  }, [results])

  const filtered = useMemo(() => {
    let rows = results.filter((r) => r.competition)
    if (yearFilter) rows = rows.filter((r) => r.competition.date?.startsWith(yearFilter))
    if (disciplineFilter) rows = rows.filter((r) => r.competition.discipline === disciplineFilter)
    return [...rows].sort((a, b) => {
      let av: string | number = 0
      let bv: string | number = 0
      if (sortKey === 'date') {
        av = a.competition?.date ?? ''
        bv = b.competition?.date ?? ''
      } else if (sortKey === 'level') {
        av = a.competition?.level ?? ''
        bv = b.competition?.level ?? ''
      } else {
        av = a.placement ?? 999
        bv = b.placement ?? 999
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [results, sortKey, sortDir, yearFilter, disciplineFilter])

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-7 px-2 pr-6 bg-[#1a1a1a] border border-[0.5px] border-white/[.08] rounded-md text-xs text-[#9ca3af] outline-none appearance-none cursor-pointer"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y!}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={disciplineFilter}
          onChange={(e) => setDisciplineFilter(e.target.value)}
          className="h-7 px-2 pr-6 bg-[#1a1a1a] border border-[0.5px] border-white/[.08] rounded-md text-xs text-[#9ca3af] outline-none appearance-none cursor-pointer"
        >
          <option value="">All disciplines</option>
          {disciplines.map((d) => (
            <option key={d} value={d!}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-[0.5px] border-white/[.07] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[0.5px] border-white/[.07] bg-[#1a1a1a]">
                <Th onClick={() => toggleSort('date')} active={sortKey === 'date'} dir={sortDir}>
                  Date
                </Th>
                <Th>Competition</Th>
                <Th>Location</Th>
                <Th onClick={() => toggleSort('level')} active={sortKey === 'level'} dir={sortDir}>
                  Level
                </Th>
                <Th>Class</Th>
                <Th>Rider</Th>
                <Th
                  onClick={() => toggleSort('placement')}
                  active={sortKey === 'placement'}
                  dir={sortDir}
                >
                  Result
                </Th>
                <Th>Faults</Th>
                <Th>Score / Time</Th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-[#4b5563]">
                    No results.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[0.5px] border-white/[.05] hover:bg-white/[.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[#9ca3af] whitespace-nowrap tabular-nums">
                      {r.competition?.date
                        ? new Date(r.competition.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#f2f2f2] whitespace-nowrap">
                      {r.competition?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280] whitespace-nowrap">
                      {r.competition?.location ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] bg-white/[.04] border border-[0.5px] border-white/[.08] text-[#6b7280]">
                        {r.competition?.level ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7280] whitespace-nowrap">
                      {r.class_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af] whitespace-nowrap">
                      {r.rider?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium whitespace-nowrap tabular-nums">
                      {r.placement ? (
                        <span
                          className={
                            r.placement <= 3 ? 'text-emerald-400' : 'text-[#f2f2f2]'
                          }
                        >
                          {ordinal(r.placement)}
                        </span>
                      ) : (
                        <span className="text-[#4b5563]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af] tabular-nums whitespace-nowrap">
                      {r.faults != null ? r.faults.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af] tabular-nums whitespace-nowrap">
                      {r.score != null
                        ? `${r.score.toFixed(3)}%`
                        : r.time != null
                        ? `${r.time.toFixed(3)}s`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  dir?: 'asc' | 'desc'
}) {
  return (
    <th
      className={`px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-medium whitespace-nowrap ${
        active ? 'text-[#f2f2f2]' : 'text-[#4b5563]'
      } ${onClick ? 'cursor-pointer hover:text-[#9ca3af] select-none' : ''}`}
      onClick={onClick}
    >
      {children}
      {active && (
        <span className="ml-1 text-[#6b7280]">{dir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
