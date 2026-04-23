'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'stabledex:stable'
const EV = 'stabledex_stable'

export interface StableEntry {
  id: string
  name: string
  breed: string
  age: number | null
  best_level: string | null
  rider_name: string
  rider_country: string
  latest_place: number | null
  latest_comp: string
  form_trend: 'up' | 'down' | 'flat'
  added_at: string
}

function load(): StableEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(entries: StableEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
    window.dispatchEvent(new Event(EV))
  } catch {}
}

export function useStable() {
  const [saved, setSaved] = useState<StableEntry[]>([])

  useEffect(() => {
    setSaved(load())
    function onUpdate() { setSaved(load()) }
    window.addEventListener(EV, onUpdate)
    return () => window.removeEventListener(EV, onUpdate)
  }, [])

  const add = useCallback((entry: StableEntry) => {
    setSaved((prev) => {
      if (prev.some((e) => e.id === entry.id)) return prev
      const next = [entry, ...prev]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((e) => e.id !== id)
      save(next)
      return next
    })
  }, [])

  const has = useCallback((id: string, current: StableEntry[]) => current.some((e) => e.id === id), [])

  const toggle = useCallback((entry: StableEntry) => {
    setSaved((prev) => {
      const exists = prev.some((e) => e.id === entry.id)
      const next = exists ? prev.filter((e) => e.id !== entry.id) : [entry, ...prev]
      save(next)
      return next
    })
  }, [])

  return { saved, add, remove, has, toggle }
}
