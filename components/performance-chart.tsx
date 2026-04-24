'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Result, Competition } from '@/lib/types'

type ResultWithComp = Result & { competition: Competition }

const PERIODS = [
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
  { label: 'All time', days: Infinity },
]

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function isDark(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.getAttribute('data-theme') !== 'light'
}

function faultColor(faults: number | null): string {
  if (faults == null) return cssVar('--c-muted', '#6b7280')
  if (faults === 0) return cssVar('--c-accent', '#22c55e')
  if (faults < 8) return cssVar('--c-muted', '#6b7280')
  return '#ef4444'
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export default function PerformanceChart({ results }: { results: ResultWithComp[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<unknown>(null)
  const rafRef = useRef<number>(0)
  const [period, setPeriod] = useState(2)
  const [theme, setTheme] = useState<string>('dark')

  useEffect(() => {
    function onTheme(e: Event) {
      setTheme((e as CustomEvent).detail as string)
    }
    window.addEventListener('themechange', onTheme)
    return () => window.removeEventListener('themechange', onTheme)
  }, [])

  const getFiltered = useCallback(
    (idx: number) => {
      const days = PERIODS[idx].days
      const cutoff = days === Infinity ? null : new Date(Date.now() - days * 86_400_000)
      const raw = results
        .filter((r) => r.competition && r.faults != null)
        .filter((r) => !cutoff || new Date(r.competition.date) >= cutoff)

      const byComp = new Map<string, ResultWithComp[]>()
      for (const r of raw) {
        const key = r.competition.id
        if (!byComp.has(key)) byComp.set(key, [])
        byComp.get(key)!.push(r)
      }
      return [...byComp.values()]
        .sort((a, b) => new Date(a[0].competition.date).getTime() - new Date(b[0].competition.date).getTime())
        .map((group) => {
          const faultVals = group.map((r) => r.faults).filter((f): f is number => f != null)
          const placementVals = group.map((r) => r.placement).filter((p): p is number => p != null)
          const avgFaults = faultVals.length > 0 ? faultVals.reduce((a, b) => a + b, 0) / faultVals.length : null
          const avgPlacement = placementVals.length > 0 ? placementVals.reduce((a, b) => a + b, 0) / placementVals.length : null
          return { competition: group[0].competition, avgFaults, avgPlacement, classCount: group.length }
        })
    },
    [results]
  )

  const runClipAnimation = useCallback((chart: any) => {
    cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const duration = 900
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      chart.options.plugins.clipLeft.progress = easeInOut(t)
      chart.update('none')
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables)
      if (!canvasRef.current) return

      const prev = chartRef.current as any
      if (prev) { prev.destroy(); chartRef.current = null }

      const dark = isDark()
      const gridColor   = dark ? 'rgba(255,255,255,0.04)' : 'rgba(22,35,28,0.04)'
      const borderColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(22,35,28,0.07)'
      const tooltipBg   = dark ? '#161616' : '#ffffff'
      const tooltipBdr  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(22,35,28,0.1)'
      const mutedColor  = cssVar('--c-muted', dark ? '#6b7280' : '#6b7c74')
      const textColor   = cssVar('--c-text',  dark ? '#f2f2f2' : '#16231c')
      const accentColor = cssVar('--c-accent', dark ? '#22c55e' : '#4f8a6f')

      const grouped = getFiltered(period)
      const showYear = grouped.length > 14

      const clipLeft = {
        id: 'clipLeft',
        beforeDatasetsDraw(chart: any) {
          const { ctx, chartArea } = chart
          if (!chartArea) return
          const p: number = chart.options.plugins.clipLeft?.progress ?? 1
          ctx.save()
          ctx.beginPath()
          ctx.rect(chartArea.left, chartArea.top - 10, chartArea.width * p, chartArea.height + 20)
          ctx.clip()
        },
        afterDatasetsDraw(chart: any) { chart.ctx.restore() },
      }

      const instance = new Chart(canvasRef.current, {
        type: 'line',
        plugins: [clipLeft],
        data: {
          labels: grouped.map((g) =>
            new Date(g.competition.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              ...(showYear ? { year: '2-digit' } : {}),
            })
          ),
          datasets: [
            {
              data: grouped.map((g) => g.avgFaults ?? 0),
              borderColor: `${accentColor}99`,
              borderWidth: 2,
              pointBackgroundColor: grouped.map((g) => faultColor(g.avgFaults)),
              pointBorderColor:     grouped.map((g) => faultColor(g.avgFaults)),
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.35,
              fill: false,
            },
          ],
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { top: 14, right: 20, bottom: 4, left: 8 },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              border: { color: borderColor },
              ticks: { color: mutedColor, font: { size: 10 }, maxTicksLimit: 9 },
            },
            y: {
              reverse: true,
              min: -0.5,
              max: 13,
              grid: { color: gridColor },
              border: { color: borderColor },
              ticks: {
                color: mutedColor,
                font: { size: 10 },
                stepSize: 4,
                callback: (v: unknown) => (Number(v) < 0 ? '' : String(v)),
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: tooltipBg,
              borderColor: tooltipBdr,
              borderWidth: 1,
              titleColor: textColor,
              titleFont: { size: 12, weight: 'bold' as const },
              bodyColor: mutedColor,
              bodyFont: { size: 11 },
              padding: 10,
              displayColors: false,
              callbacks: {
                title: (items: any[]) => grouped[items[0].dataIndex]?.competition?.name ?? '',
                beforeBody: (items: any[]) => {
                  const g = grouped[items[0].dataIndex]
                  return g?.competition?.date
                    ? new Date(g.competition.date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })
                    : ''
                },
                label: (item: any) => {
                  const g = grouped[item.dataIndex]
                  const suffix = g.classCount > 1 ? ` (avg over ${g.classCount} classes)` : ''
                  const lines = [`Avg faults: ${g.avgFaults != null ? g.avgFaults.toFixed(1) : '—'}${suffix}`]
                  if (g.avgPlacement != null) lines.push(`Avg placement: ${g.avgPlacement.toFixed(1)}`)
                  return lines
                },
              },
            },
            // @ts-expect-error custom plugin options
            clipLeft: { progress: 0 },
          },
        },
      })

      chartRef.current = instance
      runClipAnimation(instance)
    })

    return () => { cancelAnimationFrame(rafRef.current) }
  }, [period, theme, getFiltered, runClipAnimation])

  useEffect(() => {
    return () => {
      const c = chartRef.current as any
      if (c) { c.destroy(); chartRef.current = null }
    }
  }, [])

  const grouped = getFiltered(period)

  return (
    <div>
      <div className="flex items-center gap-1 mb-4">
        {PERIODS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPeriod(i)}
            className={`h-7 px-3 rounded-md text-xs transition-all duration-150 ease-out ${
              period === i
                ? 'bg-white/[.08] text-[#f2f2f2] font-medium'
                : 'text-[#4b5563] hover:text-[#9ca3af]'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#4b5563] ml-auto">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Clear</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9ca3af] inline-block" />4 faults</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />8+</span>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-[#4b5563]">
          No jumping results in this period
        </div>
      ) : (
        <div className="h-44 relative overflow-visible">
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  )
}
