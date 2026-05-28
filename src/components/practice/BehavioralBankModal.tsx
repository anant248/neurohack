"use client"

import { useState } from "react"
import type { BehavioralBankEntry } from "@/lib/types"

interface BehavioralBankModalProps {
  isOpen: boolean
  onClose: () => void
  entries: BehavioralBankEntry[]
  onAdd: (data: Omit<BehavioralBankEntry, "id" | "createdAt">) => void
  onUpdate: (id: string, data: Partial<Omit<BehavioralBankEntry, "id" | "createdAt">>) => void
  onDelete: (id: string) => void
}

const EMPTY_FORM = {
  title: "",
  situation: "",
  task: "",
  action: "",
  result: "",
  tags: [] as string[],
}

const STAR_FIELDS: Array<{ key: keyof typeof EMPTY_FORM; label: string; letter: string; color: string }> = [
  { key: "situation", label: "Situation", letter: "S", color: "var(--star-s)" },
  { key: "task", label: "Task", letter: "T", color: "var(--star-t)" },
  { key: "action", label: "Action", letter: "A", color: "var(--star-a)" },
  { key: "result", label: "Result", letter: "R", color: "var(--star-r)" },
]

export function BehavioralBankModal({
  isOpen,
  onClose,
  entries,
  onAdd,
  onUpdate,
  onDelete,
}: BehavioralBankModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!isOpen) return null

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setTagInput("")
  }

  const handleEdit = (entry: BehavioralBankEntry) => {
    setForm({
      title: entry.title,
      situation: entry.situation,
      task: entry.task,
      action: entry.action,
      result: entry.result,
      tags: [...entry.tags],
    })
    setTagInput("")
    setEditingId(entry.id)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = { ...form, title: form.title.trim() }
    if (editingId) {
      onUpdate(editingId, data)
    } else {
      onAdd(data)
    }
    resetForm()
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel bank-modal">
        <div className="modal-header">
          <div className="modal-title-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2>STAR Story Bank</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="bank-modal-body">
          {/* Form */}
          <div className="bank-form">
            <h3 className="bank-form-title">{editingId ? "Edit Story" : "Add New Story"}</h3>

            <input
              type="text"
              className="bank-input"
              placeholder="Experience title (e.g., Led migration at Acme Co.)"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            />

            {STAR_FIELDS.map(({ key, label, letter, color }) => (
              <div key={key} className="star-field">
                <span className="star-letter" style={{ color }}>{letter}</span>
                <textarea
                  className="bank-textarea"
                  placeholder={`${label} — one sentence`}
                  value={form[key] as string}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  rows={2}
                />
              </div>
            ))}

            {/* Tags */}
            <div className="bank-tags-row">
              <input
                type="text"
                className="bank-input bank-input--sm"
                placeholder="Add tag (e.g. teamwork)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button type="button" className="add-tag-btn" onClick={addTag}>
                + Tag
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="bank-tags">
                {form.tags.map(tag => (
                  <span key={tag} className="bank-tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="bank-form-actions">
              {editingId && (
                <button type="button" className="bank-btn bank-btn--ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="bank-btn bank-btn--primary"
                onClick={handleSubmit}
                disabled={!form.title.trim()}
              >
                {editingId ? "Save changes" : "Add to bank"}
              </button>
            </div>
          </div>

          {/* Entry list */}
          {entries.length > 0 && (
            <div className="bank-entries">
              <h3 className="bank-entries-title">Your Stories ({entries.length})</h3>
              {entries.map(entry => (
                <div key={entry.id} className="bank-entry">
                  <div className="bank-entry-header">
                    <span className="bank-entry-title">{entry.title}</span>
                    <div className="bank-entry-actions">
                      <button
                        type="button"
                        className="bank-entry-btn"
                        onClick={() => handleEdit(entry)}
                        title="Edit"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {confirmDeleteId === entry.id ? (
                        <>
                          <button
                            type="button"
                            className="bank-entry-btn bank-entry-btn--danger"
                            onClick={() => {
                              onDelete(entry.id)
                              setConfirmDeleteId(null)
                            }}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="bank-entry-btn"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="bank-entry-btn"
                          onClick={() => setConfirmDeleteId(entry.id)}
                          title="Delete"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bank-entry-star">
                    {STAR_FIELDS.map(({ key, letter, color }) =>
                      (entry[key] as string) ? (
                        <div key={key} className="bank-entry-star-row">
                          <span className="star-letter star-letter--sm" style={{ color }}>{letter}</span>
                          <span className="bank-entry-star-text">{entry[key] as string}</span>
                        </div>
                      ) : null,
                    )}
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="bank-tags bank-tags--readonly">
                      {entry.tags.map(tag => (
                        <span key={tag} className="bank-tag bank-tag--readonly">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {entries.length === 0 && (
            <p className="bank-empty">
              Your STAR story bank is empty. Add your first experience above to build a reusable library of interview stories.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
