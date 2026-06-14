"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { CoffeeChat, CoffeeChatQuestion, CoffeeChatTodo } from "@/lib/types"
import { SUGGESTED_QUESTIONS } from "@/lib/coffeeChats"
import { QuestionEditor } from "./QuestionEditor"
import { StickyTodos } from "./StickyTodos"

interface ChatEditorProps {
  chat: CoffeeChat
  allChats: CoffeeChat[]
  onChange: (updated: CoffeeChat) => void
  onDelete: () => void
}

export function ChatEditor({ chat, allChats, onChange, onDelete }: ChatEditorProps) {
  const [local, setLocal] = useState<CoffeeChat>(chat)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [customQuestion, setCustomQuestion] = useState("")
  const [selectedSuggested, setSelectedSuggested] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const localRef = useRef<CoffeeChat>(local)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Sync when parent switches to a different chat
  useEffect(() => {
    setLocal(chat)
    localRef.current = chat
    setShowDeleteConfirm(false)
    setShowImport(false)
  }, [chat.id])

  // Flush any pending debounce on unmount so notes are never lost when switching chats
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
        onChangeRef.current(localRef.current)
      }
    }
  }, [])

  const flush = useCallback(
    (updated: CoffeeChat) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onChangeRef.current(updated), 400)
    },
    [],
  )

  const update = (patch: Partial<CoffeeChat>) => {
    const updated = { ...local, ...patch, updatedAt: new Date() }
    setLocal(updated)
    localRef.current = updated
    flush(updated)
  }

  // Flush immediately (for todos/AI counter — need to persist ASAP)
  const updateImmediate = useCallback((patch: Partial<CoffeeChat>) => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null }
    setLocal(prev => {
      const updated = { ...prev, ...patch, updatedAt: new Date() }
      onChangeRef.current(updated)
      return updated
    })
  }, [])

  const handleTodosChange = (newTodos: CoffeeChatTodo[], newAiCount?: number) => {
    const patch: Partial<CoffeeChat> = { todos: newTodos }
    if (newAiCount !== undefined) patch.aiGenerationsUsed = newAiCount
    updateImmediate(patch)
  }

  const addSuggestedQuestion = () => {
    if (!selectedSuggested) return
    if (local.questions.some(q => q.text === selectedSuggested)) {
      setSelectedSuggested("")
      return
    }
    const q: CoffeeChatQuestion = { id: crypto.randomUUID(), text: selectedSuggested, notes: "" }
    update({ questions: [...local.questions, q] })
    setSelectedSuggested("")
  }

  const addCustomQuestion = () => {
    const text = customQuestion.trim()
    if (!text) return
    if (local.questions.some(q => q.text === text)) {
      setCustomQuestion("")
      return
    }
    const q: CoffeeChatQuestion = { id: crypto.randomUUID(), text, notes: "" }
    update({ questions: [...local.questions, q] })
    setCustomQuestion("")
  }

  const updateQuestion = (id: string, updated: CoffeeChatQuestion) => {
    update({ questions: local.questions.map(q => (q.id === id ? updated : q)) })
  }

  const deleteQuestion = (id: string) => {
    update({ questions: local.questions.filter(q => q.id !== id) })
  }

  const importFrom = (sourceChat: CoffeeChat) => {
    const existingTexts = new Set(local.questions.map(q => q.text))
    const toImport = sourceChat.questions
      .filter(q => !existingTexts.has(q.text))
      .map(q => ({ id: crypto.randomUUID(), text: q.text, notes: "" }))
    update({ questions: [...local.questions, ...toImport] })
    setShowImport(false)
  }

  const importableChats = allChats.filter(c => c.id !== chat.id && c.questions.length > 0)

  return (
    <div className="chat-editor-layout">
    <div className="chat-editor">
      {/* ── Header fields ── */}
      <div className="chat-editor-header">
        <input
          className="chat-person-input"
          placeholder="Person's name"
          value={local.personName}
          onChange={e => update({ personName: e.target.value })}
        />
        <div className="chat-meta-row">
          <input
            className="chat-meta-input"
            placeholder="Company"
            value={local.company}
            onChange={e => update({ company: e.target.value })}
          />
          <input
            className="chat-meta-input"
            placeholder="Their role"
            value={local.role}
            onChange={e => update({ role: e.target.value })}
          />
        </div>
        <div className="chat-meta-row">
          <input
            type="date"
            className="chat-meta-input"
            value={local.date}
            onChange={e => update({ date: e.target.value })}
          />
          <div className="chat-format-toggle">
            <button
              type="button"
              className={`format-btn${local.format === "virtual" ? " format-btn--active" : ""}`}
              onClick={() => update({ format: "virtual" })}
            >
              Virtual
            </button>
            <button
              type="button"
              className={`format-btn${local.format === "in-person" ? " format-btn--active" : ""}`}
              onClick={() => update({ format: "in-person" })}
            >
              In person
            </button>
          </div>
        </div>
      </div>

      {/* ── Questions ── */}
      <div className="chat-section">
        <div className="chat-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6M9 8h6M9 16h4M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Questions
          <span className="chat-section-count">{local.questions.length}</span>
        </div>

        {/* Add from suggested dropdown */}
        <div className="add-question-row">
          <select
            className="suggested-select"
            value={selectedSuggested}
            onChange={e => setSelectedSuggested(e.target.value)}
          >
            <option value="">Pick a suggested question…</option>
            {SUGGESTED_QUESTIONS.filter(q => !local.questions.some(lq => lq.text === q)).map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <button
            type="button"
            className="add-question-btn"
            onClick={addSuggestedQuestion}
            disabled={!selectedSuggested}
          >
            Add
          </button>
        </div>

        {/* Custom question */}
        <div className="add-question-row">
          <input
            className="custom-question-input"
            placeholder="Or type a custom question…"
            value={customQuestion}
            onChange={e => setCustomQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomQuestion() } }}
          />
          <button
            type="button"
            className="add-question-btn"
            onClick={addCustomQuestion}
            disabled={!customQuestion.trim()}
          >
            Add
          </button>
        </div>

        {/* Import from another chat */}
        {importableChats.length > 0 && (
          <div className="import-row">
            {showImport ? (
              <div className="import-picker">
                <span className="import-picker-label">Import questions from:</span>
                {importableChats.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className="import-chat-btn"
                    onClick={() => importFrom(c)}
                  >
                    {c.personName || "Unnamed"}{c.company ? ` · ${c.company}` : ""}
                  </button>
                ))}
                <button type="button" className="import-cancel-btn" onClick={() => setShowImport(false)}>Cancel</button>
              </div>
            ) : (
              <button
                type="button"
                className="import-questions-btn"
                onClick={() => setShowImport(true)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Import from another chat
              </button>
            )}
          </div>
        )}

        {/* Question list */}
        {local.questions.length === 0 ? (
          <p className="no-questions-hint">No questions yet — add one above.</p>
        ) : (
          <div className="question-list">
            {local.questions.map(q => (
              <QuestionEditor
                key={q.id}
                question={q}
                onChange={updated => updateQuestion(q.id, updated)}
                onDelete={() => deleteQuestion(q.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete chat ── */}
      <div className="chat-editor-footer">
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <span>Delete this coffee chat?</span>
            <button type="button" className="delete-confirm-no" onClick={() => setShowDeleteConfirm(false)}>
              Keep it
            </button>
            <button type="button" className="delete-confirm-yes" onClick={onDelete}>
              Yes, delete
            </button>
          </div>
        ) : (
          <button type="button" className="chat-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Delete chat
          </button>
        )}
      </div>
    </div>

    {/* ── Sticky to-dos panel ── */}
    <StickyTodos
      todos={local.todos}
      aiGenerationsUsed={local.aiGenerationsUsed}
      chatContext={{
        personName: local.personName,
        company: local.company,
        role: local.role,
        questions: local.questions.map(q => ({ text: q.text, notes: q.notes })),
      }}
      onChange={handleTodosChange}
    />
    </div>
  )
}
