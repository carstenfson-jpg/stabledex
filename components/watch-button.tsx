'use client'

import { useEffect, useState } from 'react'

const KEY = 'stabledex_watched'

export function useWatched() {
  const [ids, setIds] = useState<string[]>([])
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(KEY) ?? '[]')) } catch {}
  }, [])

  function toggle(id: string) {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('stabledex_watch'))
      return next
    })
  }
  return { ids, toggle }
}

export default function WatchButton({ horseId }: { horseId: string }) {
  const { ids, toggle } = useWatched()
  const watching = ids.includes(horseId)

  return (
    <button
      onClick={toggle.bind(null, horseId)}
      className={`flex items-center gap-1.5 h-7 px-3 rounded-md border border-[0.5px] text-xs transition-all duration-150 whitespace-nowrap shrink-0 ${
        watching
          ? 'bg-emerald-500/[.08] border-emerald-500/30 text-emerald-400'
          : 'bg-transparent border-white/[.1] text-[#6b7280] hover:text-[#f2f2f2] hover:border-white/20'
      }`}
    >
      <span>{watching ? '★' : '☆'}</span>
      {watching ? 'Watching' : '+ Watch'}
    </button>
  )
}
