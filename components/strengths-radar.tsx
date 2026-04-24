'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const AXES = ['Consistency', 'Win rate', 'Top 3', 'Pace', 'Experience', 'Jump-off']

interface Props {
  values: number[]
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function isDark(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.getAttribute('data-theme') !== 'light'
}

export default function StrengthsRadar({ values }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const [theme, setTheme] = useState<string>('dark')
  const DURATION = 800

  useEffect(() => {
    function onTheme(e: Event) {
      setTheme((e as CustomEvent).detail as string)
    }
    window.addEventListener('themechange', onTheme)
    return () => window.removeEventListener('themechange', onTheme)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const CSS_SIZE = 240
    const dpr = window.devicePixelRatio || 1
    canvas.width = CSS_SIZE * dpr
    canvas.height = CSS_SIZE * dpr
    canvas.style.width = `${CSS_SIZE}px`
    canvas.style.height = `${CSS_SIZE}px`

    const dark = isDark()
    const ringStroke   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(22,35,28,0.07)'
    const axisStroke   = dark ? 'rgba(255,255,255,0.06)' : 'rgba(22,35,28,0.08)'
    const fillColor    = dark ? 'rgba(34,197,94,0.12)'   : 'rgba(79,138,111,0.10)'
    const strokeColor  = dark ? 'rgba(34,197,94,0.55)'   : 'rgba(79,138,111,0.65)'
    const pointColor   = cssVar('--c-accent', dark ? '#22c55e' : '#4f8a6f')
    const labelColor   = cssVar('--c-muted',  dark ? '#6b7280' : '#6b7c74')

    function draw(progress: number) {
      const ctx = canvas!.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const size = CSS_SIZE
      const cx = size / 2, cy = size / 2
      const r = size * 0.33
      const n = 6

      ctx.clearRect(0, 0, size, size)

      // Rings
      for (let ring = 1; ring <= 4; ring++) {
        const rr = (r * ring) / 4
        ctx.beginPath()
        for (let i = 0; i < n; i++) {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2
          const x = cx + rr * Math.cos(angle)
          const y = cy + rr * Math.sin(angle)
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = ringStroke
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Axis lines
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
        ctx.strokeStyle = axisStroke
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Data polygon
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const val = ((values[i] ?? 0) / 100) * progress
        const x = cx + r * val * Math.cos(angle)
        const y = cy + r * val * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Points
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const val = ((values[i] ?? 0) / 100) * progress
        const x = cx + r * val * Math.cos(angle)
        const y = cy + r * val * Math.sin(angle)
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = pointColor
        ctx.fill()
      }

      // Labels
      ctx.fillStyle = labelColor
      ctx.font = '9px Inter, ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        const labelR = r + 20
        const x = cx + labelR * Math.cos(angle)
        const y = cy + labelR * Math.sin(angle)
        ctx.fillText(AXES[i], x, y)
      }
    }

    function animate(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(elapsed / DURATION, 1)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      draw(eased)
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }

    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [values, theme])

  return (
    <div className="border border-[0.5px] border-white/[.07] rounded-xl p-5 bg-[#1a1a1a]">
      <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-4">Strengths</p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <canvas ref={canvasRef} width={240} height={240} className="shrink-0 self-center" />
        <div className="flex-1 flex flex-col gap-2.5">
          {AXES.map((axis, i) => {
            const v = values[i] ?? 0
            const color = v > 70 ? cssVar('--c-accent', '#22c55e') : v > 40 ? cssVar('--c-muted', '#6b7280') : '#4b5563'
            return (
              <div key={axis}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#4b5563]">{axis}</span>
                  <span className="text-[10px] tabular-nums" style={{ color }}>{Math.round(v)}</span>
                </div>
                <div className="h-0.5 rounded-full bg-white/[.05] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${v}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
