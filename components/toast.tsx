'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'info' | 'error'
interface ToastItem { id: string; message: string; type: ToastType }

const Ctx = createContext<(msg: string, type?: ToastType) => void>(() => {})

export function useToast() {
  const add = useContext(Ctx)
  return {
    success: (m: string) => add(m, 'success'),
    info: (m: string) => add(m, 'info'),
    error: (m: string) => add(m, 'error'),
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(++counter.current)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const ICON = { success: '✓', error: '✕', info: 'ℹ' }
  const COLOR = {
    success: 'border-emerald-500/30 text-emerald-400',
    error: 'border-red-500/30 text-red-400',
    info: 'border-white/[.1] text-[#f2f2f2]',
  }

  return (
    <Ctx.Provider value={add}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[200] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[0.5px] text-sm bg-[#161616] shadow-xl pointer-events-auto ${COLOR[t.type]}`}
            >
              <span className="text-xs font-bold">{ICON[t.type]}</span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
