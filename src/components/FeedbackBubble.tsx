"use client"

import { useState } from "react"

const FEEDBACK_TYPES = [
  { id: "feedback", label: "Send Feedback", emoji: "💬" },
  { id: "bug",      label: "Report Bug",    emoji: "🐛" },
  { id: "feature",  label: "Request Feature", emoji: "✨" },
] as const

type FeedbackType = typeof FEEDBACK_TYPES[number]["id"]
type Status = "idle" | "submitting" | "success" | "error"

export function FeedbackBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>("feedback")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  const handleSubmit = async () => {
    if (!message.trim() || status === "submitting") return
    setStatus("submitting")
    try {
      const res = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim() }),
      })
      if (res.ok) {
        setStatus("success")
        setTimeout(() => {
          setIsOpen(false)
          setStatus("idle")
          setMessage("")
          setType("feedback")
        }, 1800)
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  const handleClose = () => {
    if (status === "submitting") return
    setIsOpen(false)
    setStatus("idle")
    setMessage("")
    setType("feedback")
  }

  return (
    <>
      {/* Floating bubble button */}
      <button
        type="button"
        className="fb-bubble"
        onClick={() => setIsOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fb-overlay"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <div className="fb-modal">
            {/* Header */}
            <div className="fb-header">
              <span className="fb-title">Share Feedback</span>
              <button
                type="button"
                className="fb-close"
                onClick={handleClose}
                aria-label="Close"
                disabled={status === "submitting"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {status === "success" ? (
              <div className="fb-success">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="fb-success-text">Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                {/* Type chips */}
                <div className="fb-type-row">
                  {FEEDBACK_TYPES.map(ft => (
                    <button
                      key={ft.id}
                      type="button"
                      className={`fb-type-chip${type === ft.id ? " fb-type-chip--active" : ""}`}
                      onClick={() => setType(ft.id)}
                    >
                      <span>{ft.emoji}</span>
                      {ft.label}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <textarea
                  className="fb-textarea"
                  placeholder={
                    type === "bug"
                      ? "Describe what happened and how to reproduce it…"
                      : type === "feature"
                      ? "Describe the feature you'd like to see…"
                      : "What's on your mind? We read every message."
                  }
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  disabled={status === "submitting"}
                />

                {status === "error" && (
                  <p className="fb-error">Something went wrong. Please try again.</p>
                )}

                {/* Submit */}
                <button
                  type="button"
                  className="fb-submit"
                  onClick={handleSubmit}
                  disabled={!message.trim() || status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <span className="fb-spinner" />
                      Sending…
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
