import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import FilterSidebar from '@/components/filter-sidebar'
import HorseList, { HorseListSkeleton } from '@/components/horse-list'
import HeroSection from '@/components/hero-section'
import StatsRow from '@/components/stats-row'
import type { HorseWithDetails } from '@/lib/types'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const discipline = params.discipline ?? ''
  const country = params.country ?? ''
  const breed = params.breed ?? ''
  const ageGroup = params.ageGroup ?? ''
  const level = params.level ?? ''
  const gender = params.gender ?? ''
  const sort = params.sort ?? 'ranking'
  const ageMin = params.ageMin ? Number(params.ageMin) : null
  const ageMax = params.ageMax ? Number(params.ageMax) : null
  const advLevels = params.advLevels?.split(',').filter(Boolean) ?? []
  const minStarts = params.minStarts ? Number(params.minStarts) : 0

  const supabase = await createClient()

  // Fetch counts in parallel with horses query
  const [
    { count: horsesCount },
    { count: resultsCount },
    { data: countryRows },
  ] = await Promise.all([
    supabase.from('horses').select('*', { count: 'exact', head: true }),
    supabase.from('results').select('*', { count: 'exact', head: true }),
    supabase.from('horses').select('country'),
  ])

  const countriesCount = new Set((countryRows ?? []).map((h: { country: string }) => h.country)).size

  let query = supabase
    .from('horses')
    .select(
      `
      id, name, breed, studbook_number, date_of_birth, gender, sire, dam,
      country, owner, current_rider_id, created_at,
      current_rider:riders!current_rider_id(id, name, country, fei_id),
      results(
        id, placement, faults, time, class_name, score, created_at,
        rider:riders(id, name, country, fei_id),
        competition:competitions(id, name, level, discipline, date, location, country)
      )
    `
    )

  if (q) {
    const { data: matchingRiders } = await supabase
      .from('riders')
      .select('id')
      .ilike('name', `%${q}%`)
    const riderIds = (matchingRiders ?? []).map((r: { id: string }) => r.id)
    let orFilter = `name.ilike.%${q}%,studbook_number.ilike.%${q}%`
    if (riderIds.length > 0) {
      orFilter += `,current_rider_id.in.(${riderIds.join(',')})`
    }
    query = query.or(orFilter)
  }
  if (breed) {
    query = query.eq('breed', breed)
  }
  if (gender) {
    query = query.eq('gender', gender)
  }
  if (country) {
    query = query.eq('country', country)
  }

  const today = new Date()
  if (ageGroup === '4-6') {
    const from = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate())
    const to = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate())
    query = query
      .gte('date_of_birth', from.toISOString().slice(0, 10))
      .lte('date_of_birth', to.toISOString().slice(0, 10))
  } else if (ageGroup === '7-10') {
    const from = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
    const to = new Date(today.getFullYear() - 7, today.getMonth(), today.getDate())
    query = query
      .gte('date_of_birth', from.toISOString().slice(0, 10))
      .lte('date_of_birth', to.toISOString().slice(0, 10))
  } else if (ageGroup === '11+') {
    const to = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate())
    query = query.lte('date_of_birth', to.toISOString().slice(0, 10))
  }

  const { data: rawHorses } = await query

  let horses = (rawHorses ?? []) as unknown as HorseWithDetails[]

  const levelMap: Record<string, string[]> = {
    gp5: ['CSI5*', 'GP', 'CDIO5*', 'CCI4*'],
    csi4: ['CSI4*', 'CDI4*'],
    csi3: ['CSI3*', 'CDI3*', 'CCI3*'],
    csi21: ['CSI1*', 'CSI2*', 'CDI1*', 'CDI2*', 'CCI1*', 'CCI2*'],
    young: ['CSI-YH', 'YH', 'Young Horse'],
  }
  if (level && levelMap[level]) {
    const allowed = new Set(levelMap[level])
    horses = horses.filter((h) =>
      h.results.some((r) => r.competition && allowed.has(r.competition.level))
    )
  }

  if (discipline) {
    horses = horses.filter((h) =>
      h.results.some((r) => r.competition?.discipline === discipline)
    )
  }

  // Advanced filters
  if (ageMin !== null || ageMax !== null) {
    const now = new Date()
    horses = horses.filter((h) => {
      if (!h.date_of_birth) return true
      const age = (now.getTime() - new Date(h.date_of_birth).getTime()) / (365.25 * 86400000)
      if (ageMin !== null && age < ageMin) return false
      if (ageMax !== null && age > ageMax) return false
      return true
    })
  }
  if (advLevels.length > 0) {
    const levelMap2: Record<string, string[]> = {
      gp5: ['CSI5*', 'GP', 'CDIO5*', 'CCI4*'], csi4: ['CSI4*', 'CDI4*'],
      csi3: ['CSI3*', 'CDI3*', 'CCI3*'], csi21: ['CSI1*', 'CSI2*', 'CDI1*', 'CDI2*', 'CCI1*', 'CCI2*'],
      young: ['CSI-YH', 'YH', 'Young Horse'],
    }
    const allowed = new Set(advLevels.flatMap((l) => levelMap2[l] ?? []))
    horses = horses.filter((h) => h.results.some((r) => r.competition && allowed.has(r.competition.level)))
  }
  if (minStarts > 0) {
    horses = horses.filter((h) => h.results.length >= minStarts)
  }

  if (sort === 'name') {
    horses = [...horses].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'recent') {
    horses = [...horses].sort((a, b) => {
      const aDate = [...a.results].map((r) => r.competition?.date ?? '').sort().reverse()[0] ?? ''
      const bDate = [...b.results].map((r) => r.competition?.date ?? '').sort().reverse()[0] ?? ''
      return bDate.localeCompare(aDate)
    })
  } else {
    horses = [...horses].sort((a, b) => {
      const placements = (h: HorseWithDetails) =>
        h.results.map((r) => r.placement).filter((p): p is number => p != null)
      const aBest = placements(a).length > 0 ? Math.min(...placements(a)) : 999
      const bBest = placements(b).length > 0 ? Math.min(...placements(b)) : 999
      return aBest - bBest
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <HeroSection />

      <StatsRow
        horses={horsesCount ?? 0}
        results={resultsCount ?? 0}
        countries={countriesCount}
      />

      {/* Two-column layout — sidebar hidden on mobile */}
      <div className="flex gap-8">
        <div className="hidden md:block w-48 shrink-0">
          <Suspense>
            <FilterSidebar />
          </Suspense>
        </div>
        <div className="flex-1 min-w-0">
          <Suspense fallback={<HorseListSkeleton />}>
            <HorseList horses={horses} total={horses.length} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
