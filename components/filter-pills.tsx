'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { COUNTRIES, DISCIPLINES } from '@/lib/types'

export default function FilterPills() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const discipline = searchParams.get('discipline') ?? ''
  const country = searchParams.get('country') ?? ''
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggle = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (params.get(key) === value) params.delete(key)
      else params.set(key, value)
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  function setCountry(c: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (c) params.set('country', c)
    else params.delete('country')
    router.push(`/?${params.toString()}`)
    setDropdownOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Discipline pills */}
      {DISCIPLINES.map((d) => (
        <Pill
          key={d}
          label={d}
          active={discipline === d}
          onClick={() => toggle('discipline', d)}
        />
      ))}
      {discipline && (
        <Pill
          label="All"
          active={false}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('discipline')
            router.push(`/?${params.toString()}`)
          }}
        />
      )}

      {/* Separator */}
      <div className="w-px h-4 bg-white/10 shrink-0" />

      {/* Country dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className={`h-7 px-3 rounded-full text-xs border border-[0.5px] transition-colors flex items-center gap-1 ${
            country
              ? 'bg-[#f2f2f2] text-[#0f0f0f] border-transparent font-medium'
              : 'bg-transparent text-[#6b7280] border-white/[.08] hover:text-[#f2f2f2] hover:border-white/20'
          }`}
        >
          {country || 'Country'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 bg-[#1e1e1e] border border-white/[.10] rounded-xl shadow-xl p-1 z-50 min-w-[160px]">
            <button
              onClick={() => setCountry('')}
              className={`w-full text-left text-sm rounded-lg px-3 py-2 transition-colors ${
                !country ? 'text-[#f2f2f2] font-medium bg-white/[.08]' : 'text-[#9ca3af] hover:bg-white/[.04] hover:text-[#f2f2f2]'
              }`}
            >
              All countries
            </button>
            {COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={`w-full text-left text-sm rounded-lg px-3 py-2 transition-colors ${
                  country === c ? 'text-[#f2f2f2] font-medium bg-white/[.08]' : 'text-[#9ca3af] hover:bg-white/[.04] hover:text-[#f2f2f2]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-3 rounded-full text-xs border border-[0.5px] transition-colors ${
        active
          ? 'bg-[#f2f2f2] text-[#0f0f0f] border-transparent font-medium'
          : 'bg-transparent text-[#6b7280] border-white/[.08] hover:text-[#f2f2f2] hover:border-white/20'
      }`}
    >
      {label}
    </button>
  )
}
