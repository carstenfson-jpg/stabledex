'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { BREEDS } from '@/lib/types'

const AGE_GROUPS = [
  { label: '4–6 years', value: '4-6' },
  { label: '7–10 years', value: '7-10' },
  { label: '11+ years', value: '11+' },
]

const LEVELS = [
  { label: 'GP & 5*', value: 'gp5' },
  { label: 'CSI 4*', value: 'csi4' },
  { label: 'CSI 3*', value: 'csi3' },
  { label: 'CSI 2*–1*', value: 'csi21' },
  { label: 'Young horses', value: 'young' },
]

const GENDERS = ['Stallion', 'Mare', 'Gelding']

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (params.get(key) === value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  const breed = searchParams.get('breed') ?? ''
  const ageGroup = searchParams.get('ageGroup') ?? ''
  const level = searchParams.get('level') ?? ''
  const gender = searchParams.get('gender') ?? ''

  return (
    <aside className="hidden md:flex flex-col gap-6">
      <Section label="Breed">
        <Option label="All breeds" active={!breed} onClick={() => set('breed', breed)} />
        {BREEDS.map((b) => (
          <Option key={b} label={b} active={breed === b} onClick={() => set('breed', b)} />
        ))}
      </Section>

      <Section label="Age">
        <Option label="All ages" active={!ageGroup} onClick={() => set('ageGroup', ageGroup)} />
        {AGE_GROUPS.map((a) => (
          <Option
            key={a.value}
            label={a.label}
            active={ageGroup === a.value}
            onClick={() => set('ageGroup', a.value)}
          />
        ))}
      </Section>

      <Section label="Level">
        <Option label="All levels" active={!level} onClick={() => set('level', level)} />
        {LEVELS.map((l) => (
          <Option
            key={l.value}
            label={l.label}
            active={level === l.value}
            onClick={() => set('level', l.value)}
          />
        ))}
      </Section>

      <Section label="Gender">
        <Option label="All" active={!gender} onClick={() => set('gender', gender)} />
        {GENDERS.map((g) => (
          <Option key={g} label={g} active={gender === g} onClick={() => set('gender', g)} />
        ))}
      </Section>
    </aside>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-1">
        {label}
      </p>
      {children}
    </div>
  )
}

function Option({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-sm py-0.5 transition-colors ${
        active ? 'text-[#f2f2f2] font-medium' : 'text-[#6b7280] hover:text-[#9ca3af]'
      }`}
    >
      {label}
    </button>
  )
}
