'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import SearchBar from './search-bar'
import FindMatch from './find-match'
import FilterPills from './filter-pills'
import AdvancedFilters from './advanced-filters'

export default function HeroSection() {
  return (
    <div className="mb-6 mx-auto text-center" style={{ maxWidth: 640 }}>
      <motion.p
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
        className="text-[11px] font-medium tracking-[0.12em] uppercase text-emerald-400 mb-3"
      >
        European competition database
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
        className="text-[34px] font-semibold tracking-tight leading-[1.15] text-[#f2f2f2] mb-5"
      >
        Find any horse.<br />
        <span className="text-emerald-400">Track every result.</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.20, ease: 'easeOut' }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <Suspense><SearchBar /></Suspense>
        <FindMatch />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28, ease: 'easeOut' }}
        className="flex justify-center"
      >
        <Suspense><FilterPills /></Suspense>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.33, ease: 'easeOut' }}
        className="mt-3"
      >
        <Suspense><AdvancedFilters /></Suspense>
      </motion.div>
    </div>
  )
}
