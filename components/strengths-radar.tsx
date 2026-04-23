'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const AXES = ['Consistency', 'Win rate', 'Top 3', 'Level', 'Experience', 'Form']

interface Props {
  values: number[] // 0–100, length 6, order matches AXES
}

export default function StrengthsRadar({ values }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const DURATION = 800

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const CSS_SIZE = 240
    const dpr = window.devicePixelRatio || 1
    canvas.width = CSS_SIZE * dpr
    canvas.height = CSS_SIZE * dpr
    canvas.style.width = `${CSS_SIZE}px`
    canvas.style.height = `${CSS_SIZE}px`

    function draw(progress: number) {
      const ctx = canvas!.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const size = CSS_SIZE
      const cx = size / 2
      const cy = size / 2
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
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Axis lines
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
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
      ctx.fillStyle = 'rgba(34,197,94,0.12)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(34,197,94,0.55)'
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
        ctx.fillStyle = '#22c55e'
        ctx.fill()
      }

      // Labels
      ctx.fillStyle = 'rgba(107,114,128,0.9)'
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
      // ease in-out
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      draw(eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    startRef.current = null
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [values])

  return (
    <div className="border border-[0.5px] border-white/[.07] rounded-xl p-5 bg-[#1a1a1a]">
      <p className="text-[10px] uppercase tracking-widest text-[#4b5563] font-medium mb-4">Strengths</p>
      <div className="flex items-center gap-5">
        {/* Radar */}
        <canvas ref={canvasRef} width={240} height={240} className="shrink-0" />

        {/* Bars */}
        <div className="flex-1 flex flex-col gap-2.5">
          {AXES.map((axis, i) => {
            const v = values[i] ?? 0
            const color = v > 70 ? '#22c55e' : v > 40 ? '#6b7280' : '#4b5563'
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
