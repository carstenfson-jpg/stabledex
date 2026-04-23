'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const LEVEL_OPTIONS = [
  { label: 'CSI 5* / GP', value: 'gp5' },
  { label: 'CSI 4*', value: 'csi4' },
  { label: 'CSI 3*', value: 'csi3' },
  { label: 'CSI 2*–1*', value: 'csi21' },
  { label: 'Young horses', value: 'young' },
]

export default function AdvancedFilters() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const ageMin = Number(searchParams.get('ageMin') ?? 4)
  const ageMax = Number(searchParams.get('ageMax') ?? 20)
  const levels = searchParams.get('advLevels')?.split(',').filter(Boolean) ?? []
  const minStarts = Number(searchParams.get('minStarts') ?? 0)

  const activeCount = (ageMin !== 4 || ageMax !== 20 ? 1 : 0) + (levels.length > 0 ? 1 : 0) + (minStarts > 0 ? 1 : 0)

  const apply = useCallback((patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') params.delete(k)
      else params.set(k, v)
    }
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  function clearAll() {
    apply({ ageMin: null, ageMax: null, advLevels: null, minStarts: null })
  }

  function toggleLevel(val: string) {
    const next = levels.includes(val) ? levels.filter((l) => l !== val) : [...levels, val]
    apply({ advLevels: next.join(',') || null })
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
                <div className="flex items-center justify-between text-xs text-[#f2f2f2] mb-2">
                  <span>{ageMin} yrs</span><span>{ageMax} yrs</span>
                </div>
                <div className="relative h-5 flex items-center">
                  <div className="absolute w-full h-0.5 bg-white/[.08] rounded-full" />
                  <div
                    className="absolute h-0.5 bg-emerald-500 rounded-full"
                    style={{ left: `${((ageMin - 4) / 16) * 100}%`, right: `${100 - ((ageMax - 4) / 16) * 100}%` }}
                  />
                  <input type="range" min={4} max={20} value={ageMin}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), ageMax - 1)
                      apply({ ageMin: v === 4 ? null : String(v) })
                    }}
                    className="absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <input type="range" min={4} max={20} value={ageMax}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value), ageMin + 1)
                      apply({ ageMax: v === 20 ? null : String(v) })
                    }}
                    className="absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
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
                <p className="text-xs text-[#f2f2f2] mb-2">{minStarts}+ starts</p>
                <input type="range" min={0} max={50} step={5} value={minStarts}
                  onChange={(e) => apply({ minStarts: e.target.value === '0' ? null : e.target.value })}
                  className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:bg-white/[.08] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-[7px]"
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
