"use client"

import { useState, useCallback, useEffect } from "react"
import type { SessionScore } from "@/lib/types"
import { FLAGS } from "@/lib/flags"
import { hasActiveSession } from "@/lib/supabase/client"

export interface AddSessionInput {
  question: string
  eyeContactScore: number
  expressionScore: number
}

/**
 * Manages the user's session history.
 * - Flag OFF → pure in-memory state (Phase 0 behaviour, no auth required)
 * - Flag ON  → loads from Supabase on mount; persists each new session via POST /api/sessions
 *
 * The returned interface is identical in both modes so calling components never change.
 */
export function useSessionHistory() {
  const [history, setHistory] = useState<SessionScore[]>([])

  // ── Load persisted history when flag is on (and the user is signed in) ──
  useEffect(() => {
    if (!FLAGS.SUPABASE_PERSISTENCE) return

    let cancelled = false
    ;(async () => {
      // Skip the API call entirely for signed-out/guest users.
      if (!(await hasActiveSession())) return
      try {
        const r = await fetch("/api/sessions")
        const { sessions } = r.ok ? await r.json() : { sessions: [] }
        if (cancelled) return
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
      } catch (err) {
        console.error("[useSessionHistory] Failed to load sessions:", err)
      }
    })()

    return () => { cancelled = true }
  }, [])

  const addSession = useCallback((input: AddSessionInput) => {
    // Optimistic local update — always happens immediately
    setHistory(prev => [
      ...prev,
      {
        attempt: prev.length + 1,
        eyeContactScore: input.eyeContactScore,
        expressionScore: input.expressionScore,
        timestamp: new Date(),
      },
    ])

    // Persist to Supabase when flag is on
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

  const clearHistory = useCallback(() => {
    // Optimistic local clear
    setHistory([])

    // Delete from Supabase when flag is on
    if (FLAGS.SUPABASE_PERSISTENCE) {
      fetch("/api/sessions", { method: "DELETE" }).catch(err =>
        console.error("[useSessionHistory] Failed to clear sessions:", err),
      )
    }
  }, [])

  return { history, addSession, clearHistory }
}
