import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HorseProfileClient from './horse-profile-client'
import {
  getDominantDiscipline,
  getBestLevel,
  LEVEL_ORDER,
  type HorseWithDetails,
  type Discipline,
} from '@/lib/types'

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('horses').select('name, breed, country').eq('id', id).single()
  if (!data) return {}
  return {
    title: `${data.name} — Stabledex`,
    description: `${data.name} · ${data.breed} · ${data.country ?? ''} — competition results and performance data on Stabledex.`,
    openGraph: {
      title: `${data.name} — Stabledex`,
      description: `${data.breed} from ${data.country ?? 'Europe'}. View full competition history and performance stats.`,
    },
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function HorsePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase
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
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const horse = raw as unknown as HorseWithDetails

  // Discipline
  const disciplines = horse.results
    .map((r) => r.competition?.discipline)
    .filter(Boolean) as Discipline[]
  const discipline = disciplines.length > 0 ? getDominantDiscipline(disciplines) : 'Show Jumping'

  // Best level
  const levels = horse.results.map((r) => r.competition?.level).filter(Boolean) as string[]
  const bestLevel = levels.length > 0 ? getBestLevel(levels) : null

  // Stats
  const jumpingResults = horse.results.filter(
    (r) => r.competition?.discipline === 'Show Jumping' && r.faults != null
  )
  const totalFaults = jumpingResults.reduce((s, r) => s + (r.faults ?? 0), 0)
  const avgFaults = jumpingResults.length > 0 ? totalFaults / jumpingResults.length : null
  const clearRounds = jumpingResults.filter((r) => r.faults === 0).length
  const clearRoundPct = jumpingResults.length > 0 ? (clearRounds / jumpingResults.length) * 100 : null

  const totalStarts = horse.results.length
  const placements = horse.results.map((r) => r.placement).filter((p): p is number => p != null)
  const wins = placements.filter((p) => p === 1).length
  const top3 = placements.filter((p) => p <= 3).length
  const winRate = totalStarts > 0 ? (wins / totalStarts) * 100 : null
  const top3Rate = totalStarts > 0 ? (top3 / totalStarts) * 100 : null
  const bestPlacement = placements.length > 0 ? Math.min(...placements) : null

  const age = horse.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(horse.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null

  const sortedResults = [...horse.results].sort((a, b) =>
    (b.competition?.date ?? '').localeCompare(a.competition?.date ?? '')
  )

  // Strength values (0–100 each): Consistency, Win rate, Top 3, Level, Experience, Form
  const strengthConsistency =
    jumpingResults.length > 0 ? Math.round((clearRounds / jumpingResults.length) * 100) : 0

  const strengthWinRate = totalStarts > 0 ? Math.min(Math.round((wins / totalStarts) * 5 * 100), 100) : 0

  const strengthTop3 = totalStarts > 0 ? Math.min(Math.round((top3 / totalStarts) * 2.5 * 100), 100) : 0

  const bestLevelScore = bestLevel ? (LEVEL_ORDER[bestLevel] ?? 0) : 0
  const maxLevelScore = 5
  const strengthLevel = Math.round((bestLevelScore / maxLevelScore) * 100)

  const strengthExperience = Math.min(Math.round((totalStarts / 60) * 100), 100)

  const last5 = sortedResults.slice(0, 5).map((r) => r.placement).filter((p): p is number => p != null)
  const avgLast5 = last5.length > 0 ? last5.reduce((s, p) => s + p, 0) / last5.length : null
  const strengthForm = avgLast5 != null ? Math.round(Math.max(0, 1 - (avgLast5 - 1) / 10) * 100) : 0

  const strengthValues = [
    strengthConsistency,
    strengthWinRate,
    strengthTop3,
    strengthLevel,
    strengthExperience,
    strengthForm,
  ]

  return (
    <HorseProfileClient
      horse={horse}
      stats={{ avgFaults, clearRoundPct, totalStarts, winRate, top3Rate, bestPlacement, bestLevel, age, strengthValues }}
      discipline={discipline}
      sortedResults={sortedResults as Parameters<typeof HorseProfileClient>[0]['sortedResults']}
    />
  )
}
