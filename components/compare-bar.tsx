'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const KEY = 'stabledex_compare'

export function useCompare() {
  const [selected, setSelected] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    function sync() {
      try { setSelected(JSON.parse(localStorage.getItem(KEY) ?? '[]')) } catch {}
    }
    sync()
    window.addEventListener('stabledex_compare', sync)
    return () => window.removeEventListener('stabledex_compare', sync)
  }, [])

  function toggle(id: string, name: string) {
    setSelected((prev) => {
      let next = prev.some((h) => h.id === id)
        ? prev.filter((h) => h.id !== id)
        : prev.length < 3 ? [...prev, { id, name }] : prev
      localStorage.setItem(KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('stabledex_compare'))
      return next
    })
  }

  function clear() {
    localStorage.setItem(KEY, '[]')
    setSelected([])
    window.dispatchEvent(new Event('stabledex_compare'))
  }

  return { selected, toggle, clear }
}

export default function CompareBar() {
  const { selected, clear } = useCompare()
  const router = useRouter()

  return (
    <AnimatePresence>
      {selected.length >= 2 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.25, ease: [0.32, 0, 0.08, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-[#141414] border-t border-[0.5px] border-white/[.1] shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">{selected.length} selected</span>
            <div className="flex items-center gap-2">
              {selected.map((h) => (
                <span key={h.id} className="text-xs text-[#f2f2f2] bg-white/[.06] border border-[0.5px] border-white/[.1] rounded-full px-2.5 py-0.5">
                  {h.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clear} className="text-xs text-[#4b5563] hover:text-[#6b7280] transition-colors px-3 py-1.5">
              Clear
            </button>
            <button
              onClick={() => router.push(`/compare?ids=${selected.map((h) => h.id).join(',')}`)}
              className="h-8 px-4 bg-emerald-500 text-[#0f0f0f] text-xs font-medium rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Compare →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
