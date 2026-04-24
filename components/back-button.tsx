'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#f2f2f2] transition-colors mb-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </button>
  )
}
