'use client'

import { motion } from 'framer-motion'

interface Props {
  horses: number
  results: number
  countries: number
}

export default function StatsRow({ horses, results, countries }: Props) {
  const stats = [
    { value: horses, label: 'Horses' },
    { value: results, label: 'Results' },
    { value: countries, label: 'Countries' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.36, ease: 'easeOut' }}
      className="border-y border-white/[.07] py-5 grid grid-cols-3 text-center mb-10"
    >
      {stats.map((s, i) => (
        <div key={s.label} className={i > 0 ? 'border-l border-white/[.07]' : ''}>
          <p className="text-xl font-semibold text-[#f2f2f2] tabular-nums">
            {s.value.toLocaleString()}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#4b5563] mt-1">{s.label}</p>
        </div>
      ))}
    </motion.div>
  )
}
