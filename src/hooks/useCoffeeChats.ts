"use client"

import { useState, useCallback, useEffect } from "react"
import type { CoffeeChat, CoffeeChatQuestion, CoffeeChatTodo } from "@/lib/types"
import { FLAGS } from "@/lib/flags"

const STORAGE_KEY = "interprep-coffee-chats"

function loadFromStorage(): CoffeeChat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<CoffeeChat & { createdAt: string; updatedAt: string }>
    return parsed.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }))
  } catch {
    return []
  }
}

function saveToStorage(chats: CoffeeChat[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {
    // ignore quota errors
  }
}

function remoteToLocal(r: Record<string, unknown>): CoffeeChat {
  return {
    id: r.id as string,
    personName: r.person_name as string,
    company: (r.company as string) ?? "",
    role: (r.role as string) ?? "",
    date: (r.date as string) ?? "",
    format: (r.format as "virtual" | "in-person") ?? "virtual",
    questions: (r.questions as CoffeeChatQuestion[]) ?? [],
    todos: (r.todos as CoffeeChatTodo[]) ?? [],
    aiGenerationsUsed: (r.ai_generations_used as number) ?? 0,
    createdAt: new Date(r.created_at as string),
    updatedAt: new Date(r.updated_at as string),
  }
}

export function useCoffeeChats() {
  const [chats, setChats] = useState<CoffeeChat[]>([])

  useEffect(() => {
    setChats(loadFromStorage())

    if (FLAGS.SUPABASE_PERSISTENCE) {
      fetch("/api/coffee-chats")
        .then(r => (r.ok ? r.json() : { chats: [] }))
        .then(({ chats: remote }: { chats: Array<Record<string, unknown>> }) => {
          const mapped = remote.map(remoteToLocal)
          setChats(mapped)
          saveToStorage(mapped)
        })
        .catch(err => console.error("[useCoffeeChats] Failed to load:", err))
    }
  }, [])

  const addChat = useCallback(
    (data: Omit<CoffeeChat, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date()
      const chat: CoffeeChat = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      setChats(prev => {
        const next = [chat, ...prev]
        saveToStorage(next)
        return next
      })

      if (FLAGS.SUPABASE_PERSISTENCE) {
        fetch("/api/coffee-chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: chat.id,
            personName: data.personName,
            company: data.company,
            role: data.role,
            date: data.date,
            format: data.format,
            questions: data.questions,
            todos: data.todos,
            aiGenerationsUsed: data.aiGenerationsUsed,
          }),
        }).catch(err => console.error("[useCoffeeChats] Failed to add:", err))
      }

      return chat
    },
    [],
  )

  const updateChat = useCallback(
    (id: string, data: Partial<Omit<CoffeeChat, "id" | "createdAt">>) => {
      const updatedAt = new Date()
      setChats(prev => {
        const next = prev.map(c => (c.id === id ? { ...c, ...data, updatedAt } : c))
        saveToStorage(next)
        return next
      })

      if (FLAGS.SUPABASE_PERSISTENCE) {
        fetch(`/api/coffee-chats/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(err => console.error("[useCoffeeChats] Failed to update:", err))
      }
    },
    [],
  )

  const deleteChat = useCallback((id: string) => {
    setChats(prev => {
      const next = prev.filter(c => c.id !== id)
      saveToStorage(next)
      return next
    })

    if (FLAGS.SUPABASE_PERSISTENCE) {
      fetch(`/api/coffee-chats/${id}`, { method: "DELETE" }).catch(err =>
        console.error("[useCoffeeChats] Failed to delete:", err),
      )
    }
  }, [])

  return { chats, addChat, updateChat, deleteChat }
}
