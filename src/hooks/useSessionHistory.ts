"use client"

import { useState, useCallback, useEffect } from "react"
import type { SessionScore } from "@/lib/types"
import { FLAGS } from "@/lib/flags"

export interface AddSessionInput {
  question: string
  eyeContactScore: number
  expressionScore: number
}

const SCORES_KEY = "interprep-session-scores"

function loadLocalScores(): SessionScore[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<SessionScore, "timestamp"> & { timestamp: string }>
    return parsed.map((s, i) => ({ ...s, attempt: i + 1, timestamp: new Date(s.timestamp) }))
  } catch {
    return []
  }
}

function appendLocalScore(score: SessionScore) {
  try {
    const existing = loadLocalScores()
    const next = [...existing, score].slice(-200)
    localStorage.setItem(SCORES_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

/**
 * Manages the user's session history.
 * - Always persists to localStorage for the Phase 6 dashboard.
 * - When SUPABASE_PERSISTENCE flag is on, also syncs with Supabase.
 */
export function useSessionHistory() {
  const [history, setHistory] = useState<SessionScore[]>([])

  useEffect(() => {
    // Load local scores first (dashboard reads from the same localStorage key)
    const local = loadLocalScores()
    if (local.length > 0) setHistory(local)

    if (!FLAGS.SUPABASE_PERSISTENCE) return

    fetch("/api/sessions")
      .then(r => (r.ok ? r.json() : { sessions: [] }))
      .then(({ sessions }) => {
        const loaded: SessionScore[] = (
          sessions as Array<{
            eye_contact_score: number
            expression_score: number
            created_at: string
          }>
        ).map((s, idx) => ({
          attempt: idx + 1,
          eyeContactScore: s.eye_contact_score,
          expressionScore: s.expression_score,
          timestamp: new Date(s.created_at),
        }))
        setHistory(loaded)
      })
      .catch(err => console.error("[useSessionHistory] Failed to load sessions:", err))
  }, [])

  const addSession = useCallback((input: AddSessionInput) => {
    setHistory(prev => {
      const next: SessionScore = {
        attempt: prev.length + 1,
        eyeContactScore: input.eyeContactScore,
        expressionScore: input.expressionScore,
        timestamp: new Date(),
      }
      appendLocalScore(next)
      return [...prev, next]
    })

    if (FLAGS.SUPABASE_PERSISTENCE) {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input.question,
          eyeContactScore: input.eyeContactScore,
          expressionScore: input.expressionScore,
        }),
      }).catch(err => console.error("[useSessionHistory] Failed to save session:", err))
    }
  }, [])

  return { history, addSession }
}
