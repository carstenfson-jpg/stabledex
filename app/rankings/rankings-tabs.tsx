'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { COUNTRIES } from '@/lib/types'

const PERIOD_OPTIONS = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '90d' },
  { label: 'Last 6 months', value: '180d' },
  { label: '2025 season', value: 'season' },
]

const DISCIPLINE_OPTIONS = ['Show Jumping', 'Dressage', 'Eventing']
const LEVEL_OPTIONS = ['CSI5*', 'CSI4*', 'CSI3*', 'GP', 'CDI5*', 'CCI4*']

interface Props {
  period: string
}

export default function RankingsTabs({ period }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/rankings?${params.toString()}`)
    },
    [router, searchParams]
  )

  const discipline = searchParams.get('discipline') ?? ''
  const level = searchParams.get('level') ?? ''
  const country = searchParams.get('country') ?? ''

  return (
    <div className="flex flex-col gap-4">
      {/* Period tabs */}
      <div className="flex gap-0 border border-[0.5px] border-white/[.07] rounded-lg overflow-hidden w-fit">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => set('period', opt.value)}
            className={`h-8 px-4 text-xs transition-colors ${
              period === opt.value
                ? 'bg-white/[.08] text-[#f2f2f2] font-medium'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          label="All disciplines"
          value={discipline}
          options={DISCIPLINE_OPTIONS}
          onChange={(v) => set('discipline', v)}
        />
        <FilterSelect
          label="All levels"
          value={level}
          options={LEVEL_OPTIONS}
          onChange={(v) => set('level', v)}
        />
        <FilterSelect
          label="All countries"
          value={country}
          options={COUNTRIES}
          onChange={(v) => set('country', v)}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 pl-3 pr-7 bg-[#1a1a1a] border border-[0.5px] border-white/[.08] rounded-md text-xs text-[#9ca3af] outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
