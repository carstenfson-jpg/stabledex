'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

interface FilterSheetProps {
  open: boolean
  onClose: () => void
}

const DISCIPLINES = [
  { label: 'Show Jumping', value: 'Show Jumping' },
  { label: 'Dressage', value: 'Dressage' },
]

const LEVELS = [
  { label: 'GP & 5*', value: 'gp5' },
  { label: 'CSI 4*', value: 'csi4' },
  { label: 'CSI 3*', value: 'csi3' },
  { label: 'CSI 2*–1*', value: 'csi21' },
  { label: 'Young horses', value: 'young' },
]

const COUNTRIES = [
  'Sweden', 'Germany', 'Netherlands', 'France', 'Belgium', 'Ireland', 'Great Britain',
]

const BREEDS = ['KWPN', 'Hanoverian', 'SWB', 'Oldenburg', 'Holsteiner']

function FilterSheetInner({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Signal to SwipeBack that a sheet is covering the screen
  useEffect(() => {
    document.body.setAttribute('data-sheet', 'open')
    return () => document.body.removeAttribute('data-sheet')
  }, [])

  // Buffer all filter changes locally — no navigation until Done
  const [discipline, setDiscipline] = useState(searchParams.get('discipline') ?? '')
  const [level, setLevel] = useState(searchParams.get('level') ?? '')
  const [country, setCountry] = useState(searchParams.get('country') ?? '')
  const [breed, setBreed] = useState(searchParams.get('breed') ?? '')

  function apply() {
    const params = new URLSearchParams(searchParams.toString())
    if (discipline) params.set('discipline', discipline); else params.delete('discipline')
    if (level) params.set('level', level); else params.delete('level')
    if (country) params.set('country', country); else params.delete('country')
    if (breed) params.set('breed', breed); else params.delete('breed')
    router.push(`/?${params.toString()}`)
    onClose()
  }

  function clearAll() {
    setDiscipline('')
    setLevel('')
    setCountry('')
    setBreed('')
    router.push('/')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Panel — draggable downward to dismiss */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
        className="fixed bottom-0 left-0 right-0 bg-[#161616] rounded-t-2xl z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — tap or drag down to close */}
        <div className="flex justify-center pt-3 pb-4 cursor-pointer" onClick={onClose}>
          <div className="w-9 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="px-5 overflow-y-auto max-h-[65vh]">
          {/* Discipline */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Discipline</p>
            <div className="flex gap-2">
              {DISCIPLINES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDiscipline((v) => v === d.value ? '' : d.value)}
                  className={`h-10 flex-1 rounded-lg text-sm border border-[0.5px] transition-colors ${
                    discipline === d.value
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Level</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel((v) => v === l.value ? '' : l.value)}
                  className={`h-9 px-3 rounded-full text-xs border border-[0.5px] transition-colors ${
                    level === l.value
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Country</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry((v) => v === c ? '' : c)}
                  className={`h-9 px-3 rounded-full text-xs border border-[0.5px] transition-colors ${
                    country === c
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Breed */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">Breed</p>
            <div className="flex flex-wrap gap-2">
              {BREEDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBreed((v) => v === b ? '' : b)}
                  className={`h-9 px-3 rounded-full text-xs border border-[0.5px] transition-colors ${
                    breed === b
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[.04] border-white/[.08] text-[#6b7280]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pt-4 pb-4 flex gap-2 border-t border-white/[.07]">
          <button
            onClick={clearAll}
            className="h-12 flex-1 rounded-xl bg-white/[.04] border border-[0.5px] border-white/[.08] text-sm text-[#9ca3af] transition-colors hover:text-[#f2f2f2]"
          >
            Clear all
          </button>
          <button
            onClick={apply}
            className="h-12 flex-1 rounded-xl bg-emerald-500 text-sm font-medium text-[#0f0f0f] transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default function FilterSheet({ open, onClose }: FilterSheetProps) {
  return (
    <AnimatePresence>
      {open && <FilterSheetInner onClose={onClose} />}
    </AnimatePresence>
  )
}
