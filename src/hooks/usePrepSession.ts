"use client"

import { useState, useCallback } from "react"
import type { PrepSession, TailoredQuestion } from "@/lib/types"
import { FLAGS } from "@/lib/flags"

function makeId() {
  return crypto.randomUUID()
}

function notesKey(companyName: string, role: string) {
  return `interprep-notes-${companyName.toLowerCase()}-${role.toLowerCase()}`
}

export function usePrepSession() {
  const [session, setSession] = useState<PrepSession | null>(null)

  const startSession = useCallback(
    (data: {
      companyName: string
      role: string
      companyBlurb: string
      companyLink: string
      jdText: string
      questions: TailoredQuestion[]
    }) => {
      const savedNotes = (() => {
        try {
          return localStorage.getItem(notesKey(data.companyName, data.role)) ?? ""
        } catch {
          return ""
        }
      })()

      const newSession: PrepSession = {
        id: makeId(),
        ...data,
        notes: savedNotes,
        createdAt: new Date(),
      }
      setSession(newSession)

      // Persist metadata to Supabase when flag is on
      if (FLAGS.SUPABASE_PERSISTENCE) {
        fetch("/api/prep-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: data.companyName,
            role: data.role,
            jdText: data.jdText,
            companyBlurb: data.companyBlurb,
            questionsJson: data.questions,
          }),
        }).catch(err => console.error("[usePrepSession] Failed to persist session:", err))
      }
    },
    [],
  )

  const saveNotes = useCallback(
    (notes: string) => {
      if (!session) return
      setSession(prev => (prev ? { ...prev, notes } : prev))
      try {
        localStorage.setItem(notesKey(session.companyName, session.role), notes)
      } catch {
        // ignore
      }

      if (FLAGS.SUPABASE_PERSISTENCE && session) {
        fetch(`/api/prep-sessions/${session.id}/notes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }).catch(err => console.error("[usePrepSession] Failed to save notes:", err))
      }
    },
    [session],
  )

  const endSession = useCallback(() => {
    setSession(null)
  }, [])

  return { session, startSession, saveNotes, endSession }
}
