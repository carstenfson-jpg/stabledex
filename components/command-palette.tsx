'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'Database', sub: 'Browse all horses', href: '/' },
  { label: 'Rankings', sub: 'FEI-style leaderboard', href: '/rankings' },
  { label: 'Events', sub: 'Upcoming competitions', href: '/events' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [recent, setRecent] = useState<{ name: string; id: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('stabledex_watched') ?? '[]')
      const names: { name: string; id: string }[] =
        JSON.parse(localStorage.getItem('stabledex_recent_horses') ?? '[]')
      setRecent(names.slice(0, 4))
    } catch {}
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('stabledex_palette', () => setOpen(true))
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setCursor(0) }
    else setQuery('')
  }, [open])

  const q = query.toLowerCase()

  const navFiltered = NAV_ITEMS.filter(
    (i) => !q || i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
  )
  const recentFiltered = recent.filter((r) => !q || r.name.toLowerCase().includes(q))

  const allItems = [
    ...navFiltered.map((i) => ({ kind: 'nav' as const, ...i })),
    ...recentFiltered.map((r) => ({ kind: 'recent' as const, label: r.name, sub: 'Horse profile', href: `/horse/${r.id}` })),
  ]

  function go(href: string) {
    router.push(href)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && allItems[cursor]) go(allItems[cursor].href)
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[150] flex items-start justify-center pt-[18vh] px-4"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-md bg-[#161616] border border-[0.5px] border-white/[.1] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-white/[.07]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(0) }}
                onKeyDown={onKeyDown}
                placeholder="Search or jump to..."
                className="flex-1 bg-transparent py-4 text-sm text-[#f2f2f2] placeholder:text-[#4b5563] outline-none"
              />
              <kbd className="text-[10px] text-[#4b5563] border border-white/[.1] rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {allItems.length === 0 && (
                <p className="px-4 py-6 text-sm text-center text-[#4b5563]">No results</p>
              )}
              {navFiltered.length > 0 && (
                <Section label="Navigation">
                  {navFiltered.map((item, idx) => (
                    <Row key={item.href} label={item.label} sub={item.sub}
                      active={cursor === idx}
                      onHover={() => setCursor(idx)}
                      onClick={() => go(item.href)} />
                  ))}
                </Section>
              )}
              {recentFiltered.length > 0 && (
                <Section label="Recent horses">
                  {recentFiltered.map((r, idx) => {
                    const globalIdx = navFiltered.length + idx
                    return (
                      <Row key={r.id} label={r.name} sub="Horse profile"
                        active={cursor === globalIdx}
                        onHover={() => setCursor(globalIdx)}
                        onClick={() => go(`/horse/${r.id}`)} />
                    )
                  })}
                </Section>
              )}
            </div>

            <div className="border-t border-white/[.06] px-4 py-2 flex gap-4 text-[10px] text-[#4b5563]">
              <span><kbd className="border border-white/[.1] rounded px-1">↑↓</kbd> navigate</span>
              <span><kbd className="border border-white/[.1] rounded px-1">↵</kbd> open</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[#4b5563] font-medium">{label}</p>
      {children}
    </div>
  )
}

function Row({ label, sub, active, onHover, onClick }: {
  label: string; sub: string; active: boolean; onHover: () => void; onClick: () => void
}) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? 'bg-white/[.06]' : 'hover:bg-white/[.03]'}`}
    >
      <div>
        <p className="text-sm text-[#f2f2f2]">{label}</p>
        <p className="text-[11px] text-[#6b7280]">{sub}</p>
      </div>
      {active && <span className="ml-auto text-[10px] text-[#4b5563]">↵</span>}
    </button>
  )
}
