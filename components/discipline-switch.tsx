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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let saved: Val = 'sj'
    try {
      const s = localStorage.getItem(KEY)
      if (s === 'dr' || s === 'sj') saved = s
    } catch {}
    setVal(saved)
    setMounted(true)
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
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          padding: 3,
          background: 'var(--c-surface2, #222)',
          borderRadius: 9999,
          border: '0.5px solid var(--c-border, rgba(255,255,255,0.08))',
        }}
      >
        {/* Sliding thumb */}
        <span
          style={{
            position: 'absolute',
            top: 3, bottom: 3, left: 3,
            width: 'calc(50% - 3px)',
            background: '#f2f2f2',
            borderRadius: 9999,
            transition: 'transform 0.35s cubic-bezier(0.65, 0.05, 0.25, 1)',
            transform: mounted && val === 'dr' ? 'translateX(100%)' : 'translateX(0)',
          }}
        />
        {(['sj', 'dr'] as Val[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => apply(v)}
            style={{
              position: 'relative',
              zIndex: 1,
              height: 32,
              padding: '0 20px',
              minWidth: 120,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: val === v ? 600 : 500,
              color: val === v ? '#0f0f0f' : 'var(--c-muted, #6b7280)',
              transition: 'color 0.25s ease',
            }}
          >
            {v === 'sj' ? 'Showjumping' : 'Dressage'}
          </button>
        ))}
      </div>
    </div>
  )
}
