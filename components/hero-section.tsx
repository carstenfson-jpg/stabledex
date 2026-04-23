'use client'

import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import SearchBar from './search-bar'
import FindMatch from './find-match'
import FilterPills from './filter-pills'
import AdvancedFilters from './advanced-filters'
import FilterSheet from './filter-sheet'
import DisciplineSwitch from './discipline-switch'

export default function HeroSection() {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  return (
    <div className="mb-6 mx-auto text-center" style={{ maxWidth: 640 }}>
      <motion.p
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
        className="text-[10px] sm:text-[11px] font-medium tracking-[0.12em] uppercase text-emerald-400 mb-3"
      >
        European competition database
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
        className="text-[22px] sm:text-[34px] font-semibold tracking-tight leading-[1.2] sm:leading-[1.15] text-[#f2f2f2] mb-5"
      >
        Find any horse.<br />
        <span className="text-emerald-400">Track every result.</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.20, ease: 'easeOut' }}
        className="flex items-center justify-center gap-2 mb-4 w-full"
      >
        <Suspense><SearchBar /></Suspense>
        {/* Find a match — desktop only */}
        <div className="hidden sm:block shrink-0">
          <FindMatch />
        </div>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setFilterSheetOpen(true)}
          className="sm:hidden flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[0.5px] border-white/[.08] text-[#6b7280] hover:text-[#f2f2f2] transition-colors shrink-0"
          style={{ width: 44, height: 44 }}
          aria-label="Open filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28, ease: 'easeOut' }}
      >
        <Suspense><DisciplineSwitch /></Suspense>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32, ease: 'easeOut' }}
        className="flex items-center justify-center gap-2 mt-3"
      >
        <Suspense><FilterPills /></Suspense>
        <Suspense><AdvancedFilters /></Suspense>
      </motion.div>

      <FilterSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} />
    </div>
  )
}
