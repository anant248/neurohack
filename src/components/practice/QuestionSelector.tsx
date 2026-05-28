"use client"

import { useState } from "react"
import type { TailoredQuestion } from "@/lib/types"

interface QuestionSelectorProps {
  questions: TailoredQuestion[]
  selectedQuestion: string
  onSelect: (question: string) => void
}

const ALL_CATEGORY = "All"

export function QuestionSelector({ questions, selectedQuestion, onSelect }: QuestionSelectorProps) {
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY)

  const categories = [ALL_CATEGORY, ...Array.from(new Set(questions.map(q => q.category)))]
  const filtered = categoryFilter === ALL_CATEGORY ? questions : questions.filter(q => q.category === categoryFilter)

  const pickRandom = () => {
    if (filtered.length === 0) return
    const idx = Math.floor(Math.random() * filtered.length)
    onSelect(filtered[idx].text)
  }

  const selectedObj = questions.find(q => q.text === selectedQuestion)

  return (
    <div className="question-panel">
      <div className="question-panel-header">
        <label className="question-label" htmlFor="question-select">
          Practice Question
        </label>
        <button className="random-btn" onClick={pickRandom} type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              fill="currentColor"
            />
          </svg>
          Random
        </button>
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-chip${categoryFilter === cat ? " category-chip--active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <select
        id="question-select"
        className="question-dropdown"
        value={selectedQuestion}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">Choose a question…</option>
        {filtered.map((q, idx) => (
          <option key={idx} value={q.text} title={q.text}>
            {q.text}
          </option>
        ))}
      </select>

      {selectedObj && (
        <div className="selected-question-block">
          <p className="selected-question-text">❝ {selectedObj.text}</p>
          {selectedObj.starHint && (
            <div className="star-hint">
              <div className="star-hint-header">
                <span className="star-badge">STAR</span>
                <span className="star-hint-label">Framework tip</span>
              </div>
              <p className="star-hint-text">{selectedObj.starHint}</p>
            </div>
          )}
          <span className="question-category-badge">{selectedObj.category}</span>
        </div>
      )}
    </div>
  )
}
