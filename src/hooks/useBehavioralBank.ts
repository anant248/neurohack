"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { BehavioralBankEntry } from "@/lib/types"
import { FLAGS } from "@/lib/flags"

const STORAGE_KEY = "interprep-behavioral-bank"

function makeId() {
  return crypto.randomUUID()
}

function loadFromStorage(): BehavioralBankEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<BehavioralBankEntry & { createdAt: string }>
    return parsed.map(e => ({ ...e, createdAt: new Date(e.createdAt) }))
  } catch {
    return []
  }
}

function saveToStorage(entries: BehavioralBankEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // ignore
  }
}

export function useBehavioralBank() {
  const [entries, setEntries] = useState<BehavioralBankEntry[]>([])
  const isAuthRef = useRef(false)

  useEffect(() => {
    setEntries(loadFromStorage())

    if (FLAGS.SUPABASE_PERSISTENCE) {
      fetch("/api/behavioral-bank")
        .then(r => (r.ok ? r.json() : { entries: [], authenticated: false }))
        .then(({ entries: remote, authenticated }: { entries: Array<Record<string, unknown>>; authenticated?: boolean }) => {
          if (!authenticated) return
          isAuthRef.current = true
          const mapped: BehavioralBankEntry[] = remote.map(e => ({
            id: e.id as string,
            title: e.title as string,
            situation: (e.situation as string) ?? "",
            task: (e.task as string) ?? "",
            action: (e.action as string) ?? "",
            result: (e.result as string) ?? "",
            tags: (e.tags as string[]) ?? [],
            createdAt: new Date(e.created_at as string),
          }))
          setEntries(mapped)
          saveToStorage(mapped)
        })
        .catch(err => console.error("[useBehavioralBank] Failed to load:", err))
    }
  }, [])

  const addEntry = useCallback(
    (data: Omit<BehavioralBankEntry, "id" | "createdAt">) => {
      const entry: BehavioralBankEntry = { ...data, id: makeId(), createdAt: new Date() }
      setEntries(prev => {
        const next = [entry, ...prev]
        saveToStorage(next)
        return next
      })

      if (FLAGS.SUPABASE_PERSISTENCE && isAuthRef.current) {
        fetch("/api/behavioral-bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: entry.id, ...data }),
        }).catch(err => console.error("[useBehavioralBank] Failed to add entry:", err))
      }
    },
    [],
  )

  const updateEntry = useCallback(
    (id: string, data: Partial<Omit<BehavioralBankEntry, "id" | "createdAt">>) => {
      setEntries(prev => {
        const next = prev.map(e => (e.id === id ? { ...e, ...data } : e))
        saveToStorage(next)
        return next
      })

      if (FLAGS.SUPABASE_PERSISTENCE && isAuthRef.current) {
        fetch(`/api/behavioral-bank/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(err => console.error("[useBehavioralBank] Failed to update entry:", err))
      }
    },
    [],
  )

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id)
      saveToStorage(next)
      return next
    })

    if (FLAGS.SUPABASE_PERSISTENCE && isAuthRef.current) {
      fetch(`/api/behavioral-bank/${id}`, { method: "DELETE" }).catch(err =>
        console.error("[useBehavioralBank] Failed to delete entry:", err),
      )
    }
  }, [])

  return { entries, addEntry, updateEntry, deleteEntry }
}
