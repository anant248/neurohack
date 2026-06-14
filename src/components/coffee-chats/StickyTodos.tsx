"use client"

import { useState } from "react"
import type { CoffeeChatTodo, CoffeeChatQuestion } from "@/lib/types"

interface StickyTodosProps {
  todos: CoffeeChatTodo[]
  aiGenerationsUsed: number
  chatContext: {
    personName: string
    company: string
    role: string
    questions: Pick<CoffeeChatQuestion, "text" | "notes">[]
  }
  onChange: (todos: CoffeeChatTodo[], aiGenerationsUsed?: number) => void
}

export function StickyTodos({ todos, aiGenerationsUsed, chatContext, onChange }: StickyTodosProps) {
  const [newText, setNewText] = useState("")
  const [generating, setGenerating] = useState(false)
  const [genMessage, setGenMessage] = useState("")

  const addTodo = (text: string, aiGenerated = false) => {
    const todo: CoffeeChatTodo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      aiGenerated,
    }
    onChange([...todos, todo])
  }

  const toggleDone = (id: string) => {
    onChange(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const deleteTodo = (id: string) => {
    onChange(todos.filter(t => t.id !== id))
  }

  const handleAdd = () => {
    if (!newText.trim()) return
    addTodo(newText)
    setNewText("")
  }

  const handleGenerate = async () => {
    if (aiGenerationsUsed >= 3 || generating) return
    setGenerating(true)
    setGenMessage("")
    try {
      const res = await fetch("/api/coffee-chats/generate-todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatContext),
      })
      const json = await res.json() as { todos?: string[]; message?: string; error?: string }

      if (!res.ok || json.error) {
        setGenMessage("Generation failed. Try again later.")
        onChange(todos, aiGenerationsUsed + 1)
        return
      }

      const generated = json.todos ?? []
      if (generated.length === 0) {
        setGenMessage(json.message ?? "Not enough context for meaningful to-dos.")
        onChange(todos, aiGenerationsUsed + 1)
        return
      }

      const newTodos: CoffeeChatTodo[] = generated.map(text => ({
        id: crypto.randomUUID(),
        text,
        done: false,
        aiGenerated: true,
      }))
      onChange([...todos, ...newTodos], aiGenerationsUsed + 1)
      setGenMessage("")
    } catch {
      setGenMessage("Network error. Try again.")
    } finally {
      setGenerating(false)
    }
  }

  const remaining = 3 - aiGenerationsUsed
  const limitReached = aiGenerationsUsed >= 3

  return (
    <div className="sticky-todos">
      {/* Header */}
      <div className="sticky-todos-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="sticky-todos-pin">
          <path d="M12 2L8 6H4l2 2-4 8 5-1 1 5 8-4 2 2v-4l4-4-4-4zM15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="sticky-todos-title">To-Dos & Follow-ups</span>
      </div>

      {/* List */}
      <div className="sticky-todos-list">
        {todos.length === 0 && (
          <p className="sticky-todos-empty">Add a follow-up or generate ideas with AI below.</p>
        )}
        {todos.map(todo => (
          <div key={todo.id} className={`sticky-todo-item${todo.done ? " sticky-todo-item--done" : ""}`}>
            <button
              type="button"
              className="sticky-todo-check"
              onClick={() => toggleDone(todo.id)}
              aria-label={todo.done ? "Mark undone" : "Mark done"}
            >
              {todo.done ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="3" fill="#92400e" />
                  <path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" rx="3" fill="none" stroke="#92400e" strokeWidth="1.5" />
                </svg>
              )}
            </button>
            <span className="sticky-todo-text">
              {todo.text}
              {todo.aiGenerated && <span className="sticky-todo-ai-badge">AI</span>}
            </span>
            <button
              type="button"
              className="sticky-todo-delete"
              onClick={() => deleteTodo(todo.id)}
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add input */}
      <div className="sticky-todo-add-row">
        <input
          className="sticky-todo-input"
          placeholder="Add a to-do…"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); handleAdd() }
          }}
        />
        <button
          type="button"
          className="sticky-todo-add-btn"
          onClick={handleAdd}
          disabled={!newText.trim()}
          aria-label="Add to-do"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="sticky-divider" />

      {/* AI generate */}
      <div className="sticky-ai-section">
        {genMessage && <p className="sticky-ai-message">{genMessage}</p>}
        <button
          type="button"
          className="sticky-ai-btn"
          onClick={handleGenerate}
          disabled={generating || limitReached}
          title={limitReached ? "AI generation limit reached for this chat" : ""}
        >
          {generating ? (
            <>
              <span className="sticky-ai-spinner" />
              Generating…
            </>
          ) : limitReached ? (
            "AI limit reached (3/3)"
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" fill="currentColor" />
              </svg>
              Generate AI to-dos ({remaining} left)
            </>
          )}
        </button>
      </div>
    </div>
  )
}
