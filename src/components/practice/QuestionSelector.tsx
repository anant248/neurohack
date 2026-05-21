"use client"

import { INTERVIEW_QUESTIONS } from "@/lib/constants"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

interface QuestionSelectorProps {
  selectedQuestion: string
  onSelect: (question: string) => void
}

export function QuestionSelector({ selectedQuestion, onSelect }: QuestionSelectorProps) {
  const pickRandom = () => {
    const idx = Math.floor(Math.random() * INTERVIEW_QUESTIONS.length)
    onSelect(INTERVIEW_QUESTIONS[idx])
  }

  return (
    <Card variant="question">
      <div className="step-indicator">
        <span className="step-number">1</span>
        <h2 className="step-title">Select Your Question</h2>
      </div>

      <select
        className="question-dropdown"
        value={selectedQuestion}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">Choose an interview question...</option>
        {INTERVIEW_QUESTIONS.map((q, idx) => (
          <option key={idx} value={q}>
            {q}
          </option>
        ))}
      </select>

      <Button variant="secondary" onClick={pickRandom} type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            fill="currentColor"
          />
        </svg>
        Random Question
      </Button>

      {selectedQuestion && (
        <div className="selected-question-box">
          <div className="question-icon">❝</div>
          <p className="selected-question">{selectedQuestion}</p>
        </div>
      )}
    </Card>
  )
}
