'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCountryFlag } from '@/lib/types'
import { HorseIcon, type Tier } from './horse-icon'
import { useCompare } from './compare-bar'

interface HorseCardProps {
  rank: number
  id: string
  name: string
  breed: string
  discipline: string
  riderName: string
  riderCountry: string
  stat: string
  statLabel: string
  tier: Tier
  sparkline?: number[]
}

export default function HorseCard({
  rank, id, name, breed, discipline,
  riderName, riderCountry, stat, statLabel, tier, sparkline,
}: HorseCardProps) {
  const [hovered, setHovered] = useState(false)
  const { selected, toggle } = useCompare()
  const isSelected = selected.some((h) => h.id === id)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-4 px-3 py-3 sm:px-4 sm:py-3.5 hover:bg-white/[.04] transition-all duration-150 ease-out border-b border-[0.5px] border-white/[.06] last:border-0 group"
    >
      <span className="text-sm text-[#4b5563] w-7 shrink-0 tabular-nums">{rank}</span>

      {/* Compare checkbox (visible on hover or selected) */}
      <button
        onClick={(e) => { e.stopPropagation(); toggle(id, name) }}
        className={`shrink-0 w-4 h-4 rounded border border-[0.5px] flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/[.2] opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><polyline points="1,4 3,6 7,2" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round"/></svg>}
      </button>

      <Link href={`/horse/${id}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        <HorseIcon tier={tier} active={hovered} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-medium max-w-[120px] sm:max-w-none truncate transition-colors duration-150"
              style={{ color: hovered ? '#ffffff' : '#f2f2f2' }}
            >
              {name}
            </span>
            <span className="hidden sm:inline-flex"><Badge label={breed} /></span>
            <Badge label={discipline} accent />
          </div>
          <p className="text-xs text-[#6b7280] mt-0.5">
            {riderName}
            {riderCountry && (
              <span className="ml-1.5">{getCountryFlag(riderCountry)} {riderCountry}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {sparkline && sparkline.length >= 3 && <Sparkline values={sparkline} />}
          <div className="text-right">
            <p className="text-sm font-medium text-[#f2f2f2] tabular-nums">{stat}</p>
            <p className="text-[10px] text-[#4b5563] uppercase tracking-wider">{statLabel}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const W = 48, H = 20
  const max = Math.max(...values, 1)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - (v / max) * (H - 2) - 1
    return `${x},${y}`
  }).join(' ')

  const first = values.slice(0, Math.ceil(values.length / 2))
  const last = values.slice(Math.floor(values.length / 2))
  const avgFirst = first.reduce((a, b) => a + b, 0) / first.length
  const avgLast = last.reduce((a, b) => a + b, 0) / last.length
  const improving = avgLast < avgFirst // fewer faults = better
  const color = improving ? '#22c55e' : '#ef4444'
  const arrow = improving ? '↑' : '↓'

  return (
    <div className="flex items-center gap-1">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </svg>
      <span className="text-xs font-medium" style={{ color }}>{arrow}</span>
    </div>
  )
}

function Badge({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] border border-[0.5px] ${
      accent
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
    }`}>
      {label}
    </span>
  )
}
