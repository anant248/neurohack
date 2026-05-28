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
  { key: "task",      label: "Task",      letter: "T", color: "var(--star-t)" },
  { key: "action",    label: "Action",    letter: "A", color: "var(--star-a)" },
  { key: "result",    label: "Result",    letter: "R", color: "var(--star-r)" },
]

export function BehavioralBankModal({
  isOpen,
  onClose,
  entries,
  onAdd,
  onUpdate,
  onDelete,
}: BehavioralBankModalProps) {
  const [view, setView] = useState<"list" | "form">("list")
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  if (!isOpen) return null

  // All unique tags across all entries
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags))).sort()

  // Filtered entries
  const visibleEntries = tagFilter
    ? entries.filter(e => e.tags.includes(tagFilter))
    : entries

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setTagInput("")
  }

  const openAdd = () => {
    resetForm()
    setView("form")
  }

  const openEdit = (entry: BehavioralBankEntry) => {
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
    setView("form")
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
    setView("list")
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

  const handleClose = () => {
    resetForm()
    setView("list")
    setTagFilter(null)
    setConfirmDeleteId(null)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-panel bank-modal">

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-title-row">
            {view === "form" ? (
              <button
                type="button"
                className="bank-back-btn"
                onClick={() => { resetForm(); setView("list") }}
                aria-label="Back to list"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            )}
            <h2>{view === "form" ? (editingId ? "Edit Story" : "New Story") : "STAR Story Bank"}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── List view ── */}
        {view === "list" && (
          <div className="bank-modal-body">
            {/* Top row: tag filters + add button */}
            <div className="bank-list-toolbar">
              <div className="bank-tag-filters">
                <button
                  type="button"
                  className={`bank-filter-chip${tagFilter === null ? " bank-filter-chip--active" : ""}`}
                  onClick={() => setTagFilter(null)}
                >
                  All ({entries.length})
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`bank-filter-chip${tagFilter === tag ? " bank-filter-chip--active" : ""}`}
                    onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button type="button" className="bank-add-btn" onClick={openAdd}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                New Story
              </button>
            </div>

            {/* Story list */}
            {visibleEntries.length > 0 ? (
              <div className="bank-entries">
                {visibleEntries.map(entry => (
                  <div key={entry.id} className="bank-entry">
                    <div className="bank-entry-header">
                      <span className="bank-entry-title">{entry.title}</span>
                      <div className="bank-entry-actions">
                        <button
                          type="button"
                          className="bank-entry-btn"
                          onClick={() => openEdit(entry)}
                          title="Edit"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        {confirmDeleteId === entry.id ? (
                          <>
                            <button
                              type="button"
                              className="bank-entry-btn bank-entry-btn--danger"
                              onClick={() => { onDelete(entry.id); setConfirmDeleteId(null) }}
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
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
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
            ) : (
              <div className="bank-empty-state">
                {tagFilter ? (
                  <>
                    <p className="bank-empty-title">No stories tagged &ldquo;{tagFilter}&rdquo;</p>
                    <button type="button" className="bank-btn bank-btn--ghost" onClick={() => setTagFilter(null)}>
                      Clear filter
                    </button>
                  </>
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.2)" }}>
                      <path
                        d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                    <p className="bank-empty-title">No stories yet</p>
                    <p className="bank-empty-sub">Build a reusable library of STAR stories for your interviews.</p>
                    <button type="button" className="bank-btn bank-btn--primary" onClick={openAdd}>
                      Add your first story
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Form view (add / edit) ── */}
        {view === "form" && (
          <div className="bank-modal-body">
            <div className="bank-form">
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
                      <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
                    </span>
                  ))}
                </div>
              )}

              <div className="bank-form-actions">
                <button
                  type="button"
                  className="bank-btn bank-btn--ghost"
                  onClick={() => { resetForm(); setView("list") }}
                >
                  Cancel
                </button>
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
          </div>
        )}

      </div>
    </div>
  )
}
