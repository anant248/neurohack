"use client"

import { useState, useEffect } from "react"

interface SessionNotesProps {
  initialNotes: string
  onSave: (notes: string) => void
}

export function SessionNotes({ initialNotes, onSave }: SessionNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(false)

  // Sync when parent resets with a new session
  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  const handleSave = () => {
    onSave(notes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="session-notes">
      <div className="session-notes-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Session Notes</span>
      </div>
      <textarea
        className="notes-textarea"
        placeholder="Jot down key points, things to remember, or follow-up questions…"
        value={notes}
        onChange={e => {
          setNotes(e.target.value)
          setSaved(false)
        }}
        rows={4}
      />
      <button
        type="button"
        className={`notes-save-btn${saved ? " notes-save-btn--saved" : ""}`}
        onClick={handleSave}
      >
        {saved ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
            </svg>
            Saved
          </>
        ) : (
          "Save notes"
        )}
      </button>
    </div>
  )
}
