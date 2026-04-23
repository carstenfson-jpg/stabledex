'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 'results'

const LEVEL_MAP: Record<string, string[]> = {
  Amateur: ['CSI1*', 'CSI2*', 'CDI1*', 'CDI2*', 'CCI1*', 'CCI2*', 'CSI-YH', 'YH', 'Young Horse'],
  'Semi-pro': ['CSI3*', 'CDI3*', 'CCI3*'],
  Professional: ['CSI4*', 'CSI5*', 'GP', 'CDIO5*', 'CDI4*', 'CDIO', 'CCI4*'],
}

interface MatchedHorse {
  id: string
  name: string
  breed: string
  country: string
  rider: string | null
}

export default function FindMatch() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [discipline, setDiscipline] = useState('')
  const [level, setLevel] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [results, setResults] = useState<MatchedHorse[]>([])
  const [loading, setLoading] = useState(false)

  function reset() {
    setStep(1)
    setDiscipline('')
    setLevel('')
    setAgeGroup('')
    setResults([])
  }

  function handleOpen() {
    reset()
    setOpen(true)
  }

  // Pass disc/lev explicitly to avoid stale closure values
  async function runSearch(ag: string, disc: string, lev: string) {
    setLoading(true)
    const supabase = createClient()

    const today = new Date()
    let dobGte: string | null = null
    let dobLte: string | null = null
    if (ag === '4–6') {
      dobGte = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
      dobLte = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
    } else if (ag === '7–10') {
      dobGte = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
      dobLte = new Date(today.getFullYear() - 7, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
    } else if (ag === '11+') {
      dobLte = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
    }

    // Step 1: find horse IDs that have results in the right discipline + level
    const allowedLevels = LEVEL_MAP[lev] ?? []
    const { data: resultRows } = await supabase
      .from('results')
      .select('horse_id, competition:competitions(discipline, level)')

    type CompRow = { discipline: string; level: string }
    const matchingIds = new Set(
      ((resultRows ?? []) as unknown as Array<{ horse_id: string; competition: CompRow | null }>)
        .filter((r) => {
          const c = r.competition
          if (!c) return false
          if (c.discipline !== disc) return false
          if (allowedLevels.length > 0 && !allowedLevels.includes(c.level)) return false
          return true
        })
        .map((r) => r.horse_id)
    )

    if (matchingIds.size === 0) {
      setResults([])
      setLoading(false)
      setStep('results')
      return
    }

    // Step 2: fetch those horses, optionally filtered by DOB
    let horsesQ = supabase
      .from('horses')
      .select('id, name, breed, country, date_of_birth, current_rider:riders!current_rider_id(name)')
      .in('id', [...matchingIds])
      .limit(8)

    if (dobGte) horsesQ = horsesQ.gte('date_of_birth', dobGte)
    if (dobLte) horsesQ = horsesQ.lte('date_of_birth', dobLte)

    const { data } = await horsesQ

    const matched = ((data ?? []) as unknown as Array<{
      id: string; name: string; breed: string; country: string
      current_rider: { name: string } | null
    }>)
      .map((h) => ({
        id: h.id,
        name: h.name,
        breed: h.breed,
        country: h.country,
        rider: h.current_rider?.name ?? null,
      }))

    setResults(matched)
    setLoading(false)
    setStep('results')
  }

  const progress = step === 'results' ? 3 : (step as number)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className={`h-11 px-4 rounded-lg border border-[0.5px] text-sm transition-all duration-150 flex items-center gap-2 ${
          open
            ? 'bg-emerald-500/[.08] border-emerald-500/30 text-emerald-400'
            : 'bg-[#1a1a1a] border-white/[.07] text-[#6b7280] hover:text-[#f2f2f2]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="8" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        Find a match
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            initial={{ x: 248 }}
            animate={{ x: 0 }}
            exit={{ x: 248 }}
            transition={{ duration: 0.28, ease: [0.32, 0, 0.08, 1] }}
            className="fixed top-0 right-0 h-full w-[248px] bg-[#141414] border-l border-[0.5px] border-white/[.07] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[0.5px] border-white/[.06]">
              <div className="flex items-center gap-2">
                {(step === 2 || step === 3 || step === 'results') && (
                  <button
                    onClick={() => {
                      if (step === 'results') { setStep(3); setAgeGroup('') }
                      else if (step === 3) { setStep(2); setLevel('') }
                      else if (step === 2) { setStep(1); setDiscipline('') }
                    }}
                    className="text-[#4b5563] hover:text-[#f2f2f2] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )}
                <span className="text-xs font-medium text-[#f2f2f2] uppercase tracking-wider">Find a match</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#4b5563] hover:text-[#f2f2f2] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1 px-5 pt-4 pb-0">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="flex-1 h-0.5 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: s <= progress ? '#22c55e' : 'rgba(255,255,255,0.08)' }}
                />
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <StepPanel key="s1" question="What discipline?">
                    {['Show Jumping', 'Dressage', 'Eventing'].map((d) => (
                      <OptionButton
                        key={d}
                        label={d}
                        active={discipline === d}
                        onClick={() => { setDiscipline(d); setStep(2) }}
                      />
                    ))}
                  </StepPanel>
                )}
                {step === 2 && (
                  <StepPanel key="s2" question="Competition level?">
                    {['Amateur', 'Semi-pro', 'Professional'].map((l) => (
                      <OptionButton
                        key={l}
                        label={l}
                        active={level === l}
                        onClick={() => { setLevel(l); setStep(3) }}
                      />
                    ))}
                  </StepPanel>
                )}
                {step === 3 && (
                  <StepPanel key="s3" question="Horse age range?">
                    {['4–6', '7–10', '11+'].map((a) => (
                      <OptionButton
                        key={a}
                        label={`${a} years`}
                        active={ageGroup === a}
                        onClick={() => { setAgeGroup(a); runSearch(a, discipline, level) }}
                      />
                    ))}
                  </StepPanel>
                )}
                {step === 'results' && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-3">
                      {loading ? 'Searching…' : `${results.length} matches found`}
                    </p>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-5 h-5 rounded-full border-2 border-white/[.08] border-t-emerald-500 animate-spin" />
                      </div>
                    ) : results.length === 0 ? (
                      <p className="text-xs text-[#4b5563] py-4">No horses match your criteria.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {results.map((h, i) => (
                          <motion.div
                            key={h.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                          >
                            <Link
                              href={`/horse/${h.id}`}
                              onClick={() => setOpen(false)}
                              className="block rounded-lg border border-[0.5px] border-white/[.07] bg-[#1a1a1a] p-3 hover:border-white/10 hover:bg-white/[.03] transition-all duration-150"
                            >
                              <p className="text-xs font-medium text-[#f2f2f2] truncate">{h.name}</p>
                              <p className="text-[10px] text-[#6b7280] mt-0.5">{h.breed} · {h.country}</p>
                              {h.rider && (
                                <p className="text-[10px] text-[#4b5563] mt-0.5 truncate">{h.rider}</p>
                              )}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={reset}
                      className="mt-5 text-[10px] uppercase tracking-wider text-[#4b5563] hover:text-[#6b7280] transition-colors"
                    >
                      Start over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

function StepPanel({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs font-medium text-[#f2f2f2] mb-4">{question}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </motion.div>
  )
}

function OptionButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border border-[0.5px] p-3 text-sm text-left transition-all duration-150 ${
        active
          ? 'bg-emerald-500/[.08] border-emerald-500/30 text-emerald-400'
          : 'bg-[#222] border-white/[.08] text-[#9ca3af] hover:border-white/[.12] hover:text-[#f2f2f2]'
      }`}
    >
      {label}
    </button>
  )
}
