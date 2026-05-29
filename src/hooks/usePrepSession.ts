"use client"

import { useState, useCallback } from "react"
import type { PrepSession, PrepHistoryEntry, TailoredQuestion } from "@/lib/types"
import { FLAGS } from "@/lib/flags"

const PREP_HISTORY_KEY = "interprep-prep-history"

function appendPrepHistory(session: PrepSession) {
  try {
    const raw = localStorage.getItem(PREP_HISTORY_KEY)
    const existing: Array<PrepHistoryEntry & { createdAt: string }> = raw ? JSON.parse(raw) : []
    const entry: PrepHistoryEntry = {
      id: session.id,
      companyName: session.companyName,
      role: session.role,
      questionCount: session.questions.length,
      createdAt: session.createdAt,
    }
    localStorage.setItem(PREP_HISTORY_KEY, JSON.stringify([entry, ...existing].slice(0, 100)))
  } catch {
    // ignore
  }
}

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
      appendPrepHistory(newSession)

      // Persist metadata to Supabase when flag is on.
      // We send the locally-generated UUID so the notes PATCH can reference it.
      if (FLAGS.SUPABASE_PERSISTENCE) {
        fetch("/api/prep-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newSession.id,
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
