"use client"

import type { FeedbackResult } from "@/lib/types"
import { Button } from "@/components/ui/Button"

interface ResultsCardProps {
  results: FeedbackResult
  isAiLoading: boolean
  onReset: () => void
}

export function ResultsCard({ results, isAiLoading, onReset }: ResultsCardProps) {
  const displayFeedback = results.aiFeedback ?? results.feedback

  return (
    <div className="results-panel">
      <div className="results-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
        </svg>
        <h2>Your Interview Insights</h2>
      </div>

      <div className="metrics-row">
        <div className="metric-item">
          <div className="metric-icon eye-contact">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="metric-body">
            <span className="metric-label">Eye Contact</span>
            <span className="metric-value">{results.eyeContactScore}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill eye-contact-fill" style={{ width: `${results.eyeContactScore}%` }} />
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-icon expression">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="metric-body">
            <span className="metric-label">Expression</span>
            <span className="metric-value">{results.expressionScore}%</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill expression-fill" style={{ width: `${results.expressionScore}%` }} />
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <h3 className="feedback-title">
          {isAiLoading ? "AI Coach thinking…" : results.aiFeedback ? "AI Coach Feedback" : "Feedback"}
        </h3>

        {isAiLoading ? (
          <div className="feedback-skeleton" aria-busy="true" aria-label="Loading AI feedback">
            <div className="skeleton-line skeleton-line--long" />
            <div className="skeleton-line skeleton-line--medium" />
            <div className="skeleton-line skeleton-line--short" />
          </div>
        ) : (
          <p className="feedback-text">{displayFeedback}</p>
        )}
      </div>

      <Button variant="ghost" onClick={onReset} type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            fill="currentColor"
          />
        </svg>
        Try Another Question
      </Button>
    </div>
  )
}
