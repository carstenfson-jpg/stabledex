'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const LEVEL_OPTIONS = [
  { label: 'CSI 5* / GP', value: 'gp5' },
  { label: 'CSI 4*', value: 'csi4' },
  { label: 'CSI 3*', value: 'csi3' },
  { label: 'CSI 2*–1*', value: 'csi21' },
  { label: 'Young horses', value: 'young' },
]

// ── Custom slider primitives ──────────────────────────────────────────────────

function useSliderTrack(min: number, max: number) {
  const trackRef = useRef<HTMLDivElement>(null)
  const getValue = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return min
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(min + pct * (max - min))
  }, [min, max])
  return { trackRef, getValue }
}

function Thumb({ onDrag }: { onDrag: (clientX: number) => void }) {
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    e.stopPropagation()
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons === 0) return
    onDrag(e.clientX)
  }
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      className="absolute w-4 h-4 rounded-full bg-[#f2f2f2] border-2 border-emerald-500 -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-grab active:cursor-grabbing active:scale-110 transition-transform touch-none"
      style={{ zIndex: 10 }}
    />
  )
}

function DualSlider({ min, max, valueMin, valueMax, onChange }: {
  min: number; max: number; valueMin: number; valueMax: number
  onChange: (min: number, max: number) => void
}) {
  const { trackRef, getValue } = useSliderTrack(min, max)
  const pctMin = ((valueMin - min) / (max - min)) * 100
  const pctMax = ((valueMax - min) / (max - min)) * 100
  return (
    <div ref={trackRef} className="relative h-5 flex items-center select-none">
      <div className="absolute w-full h-0.5 bg-white/[.08] rounded-full" />
      <div className="absolute h-0.5 bg-emerald-500 rounded-full" style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }} />
      <Thumb onDrag={(x) => onChange(Math.min(getValue(x), valueMax - 1), valueMax)} />
      <div style={{ position: 'absolute', left: `${pctMin}%` }} className="w-0 h-0">
        <Thumb onDrag={(x) => onChange(Math.min(getValue(x), valueMax - 1), valueMax)} />
      </div>
      <div style={{ position: 'absolute', left: `${pctMax}%` }} className="w-0 h-0">
        <Thumb onDrag={(x) => onChange(valueMin, Math.max(getValue(x), valueMin + 1))} />
      </div>
    </div>
  )
}

function SingleSlider({ min, max, step = 1, value, onChange }: {
  min: number; max: number; step?: number; value: number; onChange: (v: number) => void
}) {
  const { trackRef, getValue } = useSliderTrack(min, max)
  const pct = ((value - min) / (max - min)) * 100

  function snap(raw: number) {
    return Math.round(raw / step) * step
  }

  return (
    <div ref={trackRef} className="relative h-5 flex items-center select-none">
      <div className="absolute w-full h-0.5 bg-white/[.08] rounded-full" />
      <div className="absolute h-0.5 bg-emerald-500 rounded-full" style={{ left: 0, right: `${100 - pct}%` }} />
      <div style={{ position: 'absolute', left: `${pct}%` }} className="w-0 h-0">
        <Thumb onDrag={(x) => onChange(snap(getValue(x)))} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdvancedFilters() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlAgeMin = Number(searchParams.get('ageMin') ?? 4)
  const urlAgeMax = Number(searchParams.get('ageMax') ?? 20)
  const urlMinStarts = Number(searchParams.get('minStarts') ?? 0)
  const levels = searchParams.get('advLevels')?.split(',').filter(Boolean) ?? []

  const [ageMin, setAgeMin] = useState(urlAgeMin)
  const [ageMax, setAgeMax] = useState(urlAgeMax)
  const [minStarts, setMinStarts] = useState(urlMinStarts)

  useEffect(() => { setAgeMin(urlAgeMin) }, [urlAgeMin])
  useEffect(() => { setAgeMax(urlAgeMax) }, [urlAgeMax])
  useEffect(() => { setMinStarts(urlMinStarts) }, [urlMinStarts])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const apply = useCallback((patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') params.delete(k)
      else params.set(k, v)
    }
    router.replace(`/?${params.toString()}`)
  }, [router, searchParams])

  const applyDebounced = useCallback((patch: Record<string, string | null>) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => apply(patch), 300)
  }, [apply])

  const activeCount =
    (urlAgeMin !== 4 || urlAgeMax !== 20 ? 1 : 0) +
    (levels.length > 0 ? 1 : 0) +
    (urlMinStarts > 0 ? 1 : 0)

  function toggleLevel(val: string) {
    const next = levels.includes(val) ? levels.filter((l) => l !== val) : [...levels, val]
    apply({ advLevels: next.join(',') || null })
  }

  function clearAll() {
    apply({ ageMin: null, ageMax: null, advLevels: null, minStarts: null })
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 h-7 px-3 rounded-full text-xs border border-[0.5px] transition-colors ${
            open || activeCount > 0
              ? 'bg-[#f2f2f2] text-[#0f0f0f] border-transparent font-medium'
              : 'text-[#6b7280] border-white/[.08] hover:text-[#f2f2f2] hover:border-white/20'
          }`}
        >
          Filters
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-[#0f0f0f] flex items-center justify-center text-[9px] font-bold">
              {activeCount}
            </span>
          )}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-[#6b7280] hover:text-[#f2f2f2] transition-colors">
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 mx-auto grid grid-cols-3 gap-6 p-5 border border-[0.5px] border-white/[.07] rounded-xl bg-[#111111]" style={{ maxWidth: 640 }}>

              {/* Age range */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Age range</p>
                <div className="flex justify-between text-xs text-[#f2f2f2] mb-3">
                  <span>{ageMin} yrs</span><span>{ageMax} yrs</span>
                </div>
                <DualSlider
                  min={4} max={20} valueMin={ageMin} valueMax={ageMax}
                  onChange={(lo, hi) => {
                    setAgeMin(lo); setAgeMax(hi)
                    applyDebounced({ ageMin: lo === 4 ? null : String(lo), ageMax: hi === 20 ? null : String(hi) })
                  }}
                />
              </div>

              {/* Levels */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Level</p>
                <div className="flex flex-col gap-1.5">
                  {LEVEL_OPTIONS.map((l) => (
                    <button key={l.value} onClick={() => toggleLevel(l.value)}
                      className={`text-left text-xs py-0.5 transition-colors ${
                        levels.includes(l.value) ? 'text-emerald-400' : 'text-[#6b7280] hover:text-[#9ca3af]'
                      }`}
                    >
                      {levels.includes(l.value) ? '✓ ' : ''}{l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min starts */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Min. starts</p>
                <p className="text-xs text-[#f2f2f2] mb-3">{minStarts}+ starts</p>
                <SingleSlider
                  min={0} max={50} step={5} value={minStarts}
                  onChange={(v) => {
                    setMinStarts(v)
                    applyDebounced({ minStarts: v === 0 ? null : String(v) })
                  }}
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
