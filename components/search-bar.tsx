'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getBestLevel } from '@/lib/types'
import { getHorseTier, HorseIcon } from './horse-icon'

interface Suggestion {
  id: string
  name: string
  breed: string
  current_rider: { name: string } | null
  results: Array<{ competition: { level: string } | null }>
}

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleChange(v: string) {
    setValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (v.trim().length < 1) { setSuggestions([]); setOpen(false); return }
    timerRef.current = setTimeout(async () => {
      const supabase = createClient()
      const term = v.trim()

      // Search horses by name and riders by name in parallel
      const [{ data: byName }, { data: riderRows }] = await Promise.all([
        supabase
          .from('horses')
          .select('id, name, breed, current_rider:riders!current_rider_id(name), results(competition:competitions(level))')
          .ilike('name', `%${term}%`)
          .limit(5),
        supabase
          .from('riders')
          .select('id')
          .ilike('name', `%${term}%`)
          .limit(5),
      ])

      const riderIds = (riderRows ?? []).map((r: { id: string }) => r.id)
      let byRider: Suggestion[] = []
      if (riderIds.length > 0) {
        const { data } = await supabase
          .from('horses')
          .select('id, name, breed, current_rider:riders!current_rider_id(name), results(competition:competitions(level))')
          .in('current_rider_id', riderIds)
          .limit(5)
        byRider = (data ?? []) as unknown as Suggestion[]
      }

      // Merge, deduplicate by id, cap at 6
      const seen = new Set<string>()
      const merged: Suggestion[] = []
      for (const s of [...(byName ?? []) as unknown as Suggestion[], ...byRider]) {
        if (!seen.has(s.id)) { seen.add(s.id); merged.push(s) }
        if (merged.length >= 6) break
      }

      setSuggestions(merged)
      setOpen(merged.length > 0)
    }, 150)
  }

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setOpen(false)
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) params.set('q', value.trim())
      else params.delete('q')
      router.push(`/?${params.toString()}`)
    },
    [value, router, searchParams]
  )

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={submit} className="flex w-full gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search horse name, rider, or studbook..."
          className="flex-1 h-11 px-4 bg-[#1a1a1a] border border-white/[.07] rounded-lg text-sm text-[#f2f2f2] placeholder-[#4b5563] outline-none focus:border-white/20 transition-colors"
        />
        <button type="submit" className="h-11 px-5 bg-[#f2f2f2] text-[#0f0f0f] text-sm font-medium rounded-lg hover:bg-white transition-colors shrink-0">
          Search
        </button>
      </form>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-16 bg-[#1a1a1a] border border-[0.5px] border-white/[.1] rounded-lg overflow-hidden z-50 shadow-xl">
          {suggestions.map((s) => {
            const levels = s.results.map((r) => r.competition?.level).filter(Boolean) as string[]
            const tier = getHorseTier(levels.length > 0 ? getBestLevel(levels) : null)
            return (
              <Link
                key={s.id}
                href={`/horse/${s.id}`}
                onClick={() => { setOpen(false); setValue('') }}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[.04] transition-colors border-b border-[0.5px] border-white/[.06] last:border-0"
              >
                <HorseIcon tier={tier} boxSize={28} size={14} radius={6} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f2f2f2] truncate">{s.name}</p>
                  <p className="text-xs text-[#4b5563] truncate">
                    {s.breed}{s.current_rider ? ` · ${s.current_rider.name}` : ''}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
