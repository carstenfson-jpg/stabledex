'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const KEY = 'app-discipline'
const MAP = { sj: 'Show Jumping', dr: 'Dressage' } as const
type Val = keyof typeof MAP

export default function DisciplineSwitch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [val, setVal] = useState<Val>('sj')

  // On mount: pick up from localStorage (or URL), then sync URL
  useEffect(() => {
    let saved: Val = 'sj'
    try {
      const s = localStorage.getItem(KEY)
      if (s === 'dr' || s === 'sj') saved = s
    } catch {}
    setVal(saved)
    // Push to URL if not already set
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('discipline') !== MAP[saved]) {
      params.set('discipline', MAP[saved])
      router.replace(`/?${params.toString()}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function apply(v: Val) {
    setVal(v)
    try { localStorage.setItem(KEY, v) } catch {}
    const params = new URLSearchParams(searchParams.toString())
    params.set('discipline', MAP[v])
    router.push(`/?${params.toString()}`)
    document.dispatchEvent(new CustomEvent('discipline:change', { detail: v }))
  }

  return (
    <div className={`discipline-switch on-${val}`}>
      <span className="thumb" />

      <button data-v="sj" type="button" onClick={() => apply('sj')}>
        <span className="lbl">Showjumping</span>
        <svg width="36" height="22" viewBox="0 0 36 22" fill="none"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9 L14 6 L16 7" />
          <circle cx="14" cy="5" r="1.2" fill="currentColor" />
          <path d="M6 14 C 8 8, 14 6, 20 8 C 23 9, 25 12, 26 14" />
          <path d="M25 14 L29 11 L31 12 L30 14" />
          <path d="M22 14 L21 17 M24 14 L24 17" />
          <path d="M9 14 L8 18 M11 14 L11 18" />
          <path d="M2 20 L14 20" strokeWidth="1.4" />
          <path d="M4 17 L12 17" />
          <path d="M3 20 L3 22 M13 20 L13 22" />
        </svg>
      </button>

      <button data-v="dr" type="button" onClick={() => apply('dr')}>
        <span className="lbl">Dressage</span>
        <svg width="36" height="22" viewBox="0 0 36 22" fill="none"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10 L20 6" />
          <circle cx="20" cy="4.5" r="1.2" fill="currentColor" />
          <path d="M10 16 C 12 10, 18 9, 22 10 C 25 11, 27 13, 28 15" />
          <path d="M27 14 C 30 10, 31 8, 30 6 L 28 8" />
          <path d="M24 15 L23 18" />
          <path d="M25 15 L27 13 L27 17" />
          <path d="M12 16 L11 20 M14 16 L14 20" />
          <path d="M4 21 L32 21" strokeDasharray="2 2" opacity="0.5" />
        </svg>
      </button>
    </div>
  )
}
