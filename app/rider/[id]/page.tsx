import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCountryFlag, getDominantDiscipline, type Discipline } from '@/lib/types'
import RiderHorseList from '@/components/rider-horse-list'
import BackButton from '@/components/back-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('riders').select('name, country').eq('id', id).single()
  if (!data) return {}
  return {
    title: `${data.name} — Stabledex`,
    description: `${data.name} · ${data.country} — rider profile on Stabledex.`,
  }
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function formScore(placement: number | null): number {
  if (placement == null) return 50
  if (placement === 1) return 100
  if (placement >= 30) return 20
  return Math.max(20, 100 - (placement - 1) * 2.8)
}

function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

export default async function RiderPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: rider }, { data: resultsRaw }, { data: horsesRaw }] = await Promise.all([
    supabase.from('riders').select('id, name, country, fei_id, date_of_birth').eq('id', id).single(),
    supabase
      .from('results')
      .select('id, placement, horse_id, competition:competitions(date, level, discipline)')
      .eq('rider_id', id),
    supabase
      .from('horses')
      .select('id, name, breed, date_of_birth, country, results(competition:competitions(level, discipline))')
      .eq('current_rider_id', id),
  ])

  if (!rider) notFound()

  type ResultRow = {
    id: string
    placement: number | null
    horse_id: string
    competition: { date: string; level: string; discipline: string } | null
  }
  type HorseRow = {
    id: string
    name: string
    breed: string
    date_of_birth: string | null
    country: string
    results: Array<{ competition: { level: string; discipline: string } | null }>
  }

  const allResults = (resultsRaw ?? []) as unknown as ResultRow[]
  const horses = (horsesRaw ?? []) as unknown as HorseRow[]

  // Stats
  const starts = allResults.length
  const wins = allResults.filter((r) => r.placement === 1).length
  const uniqueHorses = new Set(allResults.map((r) => r.horse_id)).size
  const activeYears = new Set(
    allResults.map((r) => r.competition?.date).filter(Boolean).map((d) => d!.slice(0, 4))
  ).size

  // Discipline chip
  const disciplines = allResults
    .map((r) => r.competition?.discipline)
    .filter(Boolean) as Discipline[]
  const dominantDiscipline = disciplines.length > 0 ? getDominantDiscipline(disciplines) : null

  // Form chart: last 12 results sorted by date ascending
  const dated = allResults
    .filter((r) => r.competition?.date)
    .sort((a, b) => a.competition!.date.localeCompare(b.competition!.date))
  const last12 = dated.slice(-12)
  const scores = last12.map((r) => formScore(r.placement))
  const chartCount = scores.length
  const lastScore = scores[chartCount - 1] ?? 50
  const firstScore = scores[0] ?? 50
  const delta = Math.round(lastScore - firstScore)
  const isGreen = delta >= 0
  const lineColor = isGreen ? '#34d399' : '#f87171'
  const fillRgb = isGreen ? '34,197,94' : '239,68,68'

  const CW = 300, CH = 60
  const pts = scores.map((s, i) => ({
    x: chartCount > 1 ? (i / (chartCount - 1)) * CW : CW / 2,
    y: CH - (s / 100) * CH,
  }))
  const linePath = buildSmoothPath(pts)
  const areaPath =
    pts.length > 1
      ? `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${CH} L ${pts[0].x.toFixed(2)} ${CH} Z`
      : ''
  const gradId = `form-grad-${id.slice(0, 8)}`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <BackButton />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mb-8">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full border border-[0.5px] border-white/[.07] flex items-center justify-center shrink-0 text-lg font-semibold text-[#9ca3af] tracking-wide"
          style={{ background: 'radial-gradient(circle at 40% 40%, var(--c-surface2), var(--c-surface))' }}
        >
          {initials(rider.name)}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-[#f2f2f2] tracking-[-0.015em] mb-1">
            {rider.name}
          </h1>
          <p className="text-sm text-[#6b7280] mb-2.5">
            {rider.country && `${getCountryFlag(rider.country)} ${rider.country}`}
            {(rider as Record<string, unknown>).date_of_birth && (
              <span className="ml-3 tabular-nums text-[#4b5563]">
                b. {new Date((rider as Record<string, unknown>).date_of_birth as string).getFullYear()}
              </span>
            )}
            {rider.fei_id && <span className="ml-3 tabular-nums text-[#4b5563]">FEI {rider.fei_id}</span>}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {dominantDiscipline && (
              <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] border border-[0.5px] bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                {dominantDiscipline}
              </span>
            )}
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] border border-[0.5px] bg-white/[.04] border-white/[.08] text-[#6b7280]">
              {horses.length} horse{horses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="border border-[0.5px] border-white/[.07] rounded-xl bg-[#1a1a1a] mb-4 grid grid-cols-4">
        {[
          { label: 'STARTS', value: starts },
          { label: 'WINS', value: wins },
          { label: 'HORSES', value: uniqueHorses },
          { label: 'ACTIVE', value: activeYears ? `${activeYears}y` : '—' },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className={`flex flex-col items-center py-4 ${i < arr.length - 1 ? 'border-r border-[0.5px] border-white/[.07]' : ''}`}
          >
            <span className="text-xl font-semibold text-[#f2f2f2] tabular-nums">{s.value}</span>
            <span className="text-[9px] tracking-[0.1em] uppercase text-[#4b5563] mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Form index chart ───────────────────────────────────────────────── */}
      {chartCount >= 2 && (
        <div className="border border-[0.5px] border-white/[.07] rounded-xl bg-[#1a1a1a] px-5 pt-4 pb-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#4b5563]">Form index</p>
            <div className="flex items-center gap-1.5 text-xs tabular-nums" style={{ color: lineColor }}>
              <span className="text-[#9ca3af]">{Math.round(lastScore)}</span>
              <span>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CW} ${CH}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: 60 }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`rgba(${fillRgb},0.28)`} />
                <stop offset="100%" stopColor={`rgba(${fillRgb},0)`} />
              </linearGradient>
            </defs>
            {/* Dashed baseline */}
            <line
              x1="0" y1={CH / 2} x2={CW} y2={CH / 2}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="4 4"
            />
            {/* Area fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
            {/* Line */}
            {linePath && (
              <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* End dot */}
            {pts.length > 0 && (
              <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={lineColor} />
            )}
          </svg>

          <div className="flex justify-between text-[9px] text-[#4b5563] mt-1.5 tabular-nums">
            <span>{chartCount} starts ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* ── Horse list ─────────────────────────────────────────────────────── */}
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#4b5563] font-medium mb-3">
        Horses ({horses.length})
      </p>
      <RiderHorseList horses={horses as Parameters<typeof RiderHorseList>[0]['horses']} />
    </div>
  )
}
