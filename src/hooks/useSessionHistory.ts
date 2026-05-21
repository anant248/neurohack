"use client"

import { useState, useCallback } from "react"
import type { SessionScore } from "@/lib/types"

// In Phase 2, the body of this hook will swap to Supabase queries
// while the interface remains identical — components never change.
export function useSessionHistory() {
  const [history, setHistory] = useState<SessionScore[]>([])

  const addSession = useCallback(
    (scores: Pick<SessionScore, "eyeContactScore" | "expressionScore">) => {
      setHistory(prev => [
        ...prev,
        {
          attempt: prev.length + 1,
          eyeContactScore: scores.eyeContactScore,
          expressionScore: scores.expressionScore,
          timestamp: new Date(),
        },
      ])
    },
    [],
  )

  return { history, addSession }
}
