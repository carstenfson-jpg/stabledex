'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const TRIGGER_THRESHOLD = 90  // px to trigger navigation
const SHOW_THRESHOLD = 12     // px before indicator appears

export default function SwipeBack() {
  const router = useRouter()
  const [pull, setPull] = useState(0) // 0–1 progress
  const startY = useRef(0)
  const startX = useRef(0)
  const active = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      // Only activate when page is scrolled to the very top and no sheet is open
      if (window.scrollY > 4) return
      if (document.body.hasAttribute('data-sheet')) return
      startY.current = e.touches[0].clientY
      startX.current = e.touches[0].clientX
      active.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!active.current) return
      const dy = e.touches[0].clientY - startY.current
      const dx = Math.abs(e.touches[0].clientX - startX.current)
      // Cancel if sideways swipe
      if (dx > dy * 0.6) { active.current = false; setPull(0); return }
      if (dy < SHOW_THRESHOLD) { setPull(0); return }
      setPull(Math.min(dy / TRIGGER_THRESHOLD, 1))
    }

    function onTouchEnd(e: TouchEvent) {
      if (!active.current) return
      active.current = false
      const dy = e.changedTouches[0].clientY - startY.current
      const dx = Math.abs(e.changedTouches[0].clientX - startX.current)
      setPull(0)
      if (dy >= TRIGGER_THRESHOLD && dx < dy * 0.6) {
        router.back()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [router])

  if (pull === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] flex justify-center pointer-events-none sm:hidden"
      style={{ paddingTop: `${8 + pull * 32}px`, opacity: pull }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-white/[.1] text-[11px] text-[#9ca3af] shadow-lg"
        style={{ transform: `scale(${0.85 + pull * 0.15})` }}
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: pull >= 1 ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        {pull >= 1 ? 'Release to go back' : 'Go back'}
      </div>
    </div>
  )
}
