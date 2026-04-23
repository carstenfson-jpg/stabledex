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

const PLACEHOLDER_PHRASES = [
  'Peder Fredricson',
  'Catch Me Not S',
  'Maikel van der Vleuten',
  'Killer Queen VDM',
  'Jessica von Bredow-Werndl',
  'Dalera BB',
  'Ben Maher',
  'Explosion W',
]

function useAnimatedPlaceholder(active: boolean) {
  const [display, setDisplay] = useState('')
  const phraseIdx = useRef(0)
  const charIdx = useRef(0)
  const deleting = useRef(false)
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) { setDisplay(''); return }

    function tick() {
      const phrase = PLACEHOLDER_PHRASES[phraseIdx.current]

      if (!deleting.current) {
        charIdx.current += 1
        setDisplay(phrase.slice(0, charIdx.current))
        if (charIdx.current >= phrase.length) {
          deleting.current = true
          rafRef.current = setTimeout(tick, 1600) // pause at end
          return
        }
        rafRef.current = setTimeout(tick, 75)
      } else {
        charIdx.current -= 1
        setDisplay(phrase.slice(0, charIdx.current))
        if (charIdx.current <= 0) {
          deleting.current = false
          phraseIdx.current = (phraseIdx.current + 1) % PLACEHOLDER_PHRASES.length
          rafRef.current = setTimeout(tick, 400) // pause before next
          return
        }
        rafRef.current = setTimeout(tick, 32)
      }
    }

    rafRef.current = setTimeout(tick, 900)
    return () => { if (rafRef.current) clearTimeout(rafRef.current) }
  }, [active])

  return display
}

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animatedPlaceholder = useAnimatedPlaceholder(!focused && !value)

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
          onFocus={() => { setFocused(true); suggestions.length > 0 && setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder={focused || value ? 'Search horse name, rider, or studbook...' : animatedPlaceholder}
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
