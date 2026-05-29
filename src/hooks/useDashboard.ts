"use client"

import { useState, useEffect } from "react"
import type { SessionScore, PrepHistoryEntry } from "@/lib/types"

const SCORES_KEY = "interprep-session-scores"
const PREP_HISTORY_KEY = "interprep-prep-history"

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Pure function — exported for unit tests. */
export function computeStreak(scores: SessionScore[]): number {
  if (scores.length === 0) return 0

  const practicedDates = new Set(scores.map(s => toDateStr(new Date(s.timestamp))))
  const today = new Date()

  // If practiced today start from offset 0, otherwise start from yesterday
  const startOffset = practicedDates.has(toDateStr(today)) ? 0 : 1

  let streak = 0
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (practicedDates.has(toDateStr(d))) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export interface DashboardData {
  scores: SessionScore[]
  prepHistory: PrepHistoryEntry[]
  streak: number
  avgEyeContact: number | null
  avgExpression: number | null
  isLoaded: boolean
}

export function useDashboard(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    scores: [],
    prepHistory: [],
    streak: 0,
    avgEyeContact: null,
    avgExpression: null,
    isLoaded: false,
  })

  useEffect(() => {
    const scores: SessionScore[] = (() => {
      try {
        const raw = localStorage.getItem(SCORES_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as Array<Omit<SessionScore, "timestamp"> & { timestamp: string }>
        return parsed.map((s, i) => ({ ...s, attempt: i + 1, timestamp: new Date(s.timestamp) }))
      } catch {
        return []
      }
    })()

    const prepHistory: PrepHistoryEntry[] = (() => {
      try {
        const raw = localStorage.getItem(PREP_HISTORY_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as Array<PrepHistoryEntry & { createdAt: string }>
        return parsed.map(e => ({ ...e, createdAt: new Date(e.createdAt) }))
      } catch {
        return []
      }
    })()

    const streak = computeStreak(scores)
    const avgEyeContact =
      scores.length > 0
        ? Math.round(scores.reduce((s, r) => s + r.eyeContactScore, 0) / scores.length)
        : null
    const avgExpression =
      scores.length > 0
        ? Math.round(scores.reduce((s, r) => s + r.expressionScore, 0) / scores.length)
        : null

    setData({ scores, prepHistory, streak, avgEyeContact, avgExpression, isLoaded: true })
  }, [])

  return data
}
