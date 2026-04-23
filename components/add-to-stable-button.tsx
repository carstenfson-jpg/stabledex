'use client'

import { useStable, type StableEntry } from '@/lib/use-stable'

export default function AddToStableButton({ entry }: { entry: StableEntry }) {
  const { saved, toggle } = useStable()
  const inStable = saved.some((e) => e.id === entry.id)

  return (
    <button
      onClick={() => toggle(entry)}
      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
        inStable
          ? 'text-emerald-400 hover:text-emerald-300'
          : 'text-[#4b5563] hover:text-[#9ca3af]'
      }`}
    >
      {inStable ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <polyline points="1.5,6 4.5,9 10.5,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          In Stable
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add to Stable
        </>
      )}
    </button>
  )
}
