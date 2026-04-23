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

  useEffect(() => {
    let saved: Val = 'sj'
    try {
      const s = localStorage.getItem(KEY)
      if (s === 'dr' || s === 'sj') saved = s
    } catch {}
    setVal(saved)
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
    <div className="discipline-seg-wrap">
      <div className={`discipline-seg on-${val}`}>
        <span className="thumb" />
        <button data-v="sj" type="button" onClick={() => apply('sj')}>Showjumping</button>
        <button data-v="dr" type="button" onClick={() => apply('dr')}>Dressage</button>
      </div>
    </div>
  )
}
