"use client"

import { useState } from "react"
import type { BehavioralPrepResponse } from "@/lib/types"

interface SetupPanelProps {
  /** Controlled value — passed from useResume which hydrates from localStorage */
  resumeText: string
  onResumeChange: (text: string) => void
  onGenerate: (data: BehavioralPrepResponse, jdText: string) => void
  /** Skip tailoring entirely — jumps straight to session with general questions */
  onPracticeGeneral: () => void
}

export function SetupPanel({ resumeText, onResumeChange, onGenerate, onPracticeGeneral }: SetupPanelProps) {
  const [jdMode, setJdMode] = useState<"paste" | "url">("paste")
  const [jdText, setJdText] = useState("")
  const [jdUrl, setJdUrl] = useState("")
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchUrl = async () => {
    if (!jdUrl.trim()) return
    setIsFetchingUrl(true)
    setError(null)
    try {
      const res = await fetch("/api/fetch-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl.trim() }),
      })
      const data = (await res.json()) as { text?: string; error?: string }
      if (!res.ok || !data.text) {
        setError(data.error ?? "Failed to fetch job description from URL.")
        return
      }
      setJdText(data.text)
      setJdMode("paste")
    } catch {
      setError("Network error while fetching the URL. Try pasting the JD instead.")
    } finally {
      setIsFetchingUrl(false)
    }
  }

  const handleGenerate = async () => {
    const effectiveJd = jdText.trim()
    if (!resumeText.trim()) {
      setError("Please paste your resume before generating questions.")
      return
    }
    if (!effectiveJd) {
      setError("Please provide a job description (paste or fetch from URL).")
      return
    }

    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/behavioral-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeText.trim(), jobDescriptionText: effectiveJd }),
      })
      const data = (await res.json()) as BehavioralPrepResponse & { error?: string }
      if (!res.ok || !data.companyName) {
        setError(data.error ?? "Failed to generate questions. Please try again.")
        return
      }
      onGenerate(data, effectiveJd)
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const canGenerate = resumeText.trim().length > 0 && jdText.trim().length > 0 && !isGenerating

  return (
    <div className="setup-panel">
      <div className="setup-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2>Set Up Your Practice Session</h2>
      </div>

      {/* Resume section */}
      <div className="setup-section">
        <label className="setup-label" htmlFor="resume-input">
          Your Resume
          <span className="setup-label-hint">Paste your master resume — saved for future sessions</span>
        </label>
        <textarea
          id="resume-input"
          className="setup-textarea"
          placeholder="Paste your resume here…"
          value={resumeText}
          onChange={e => onResumeChange(e.target.value)}
          rows={6}
        />
      </div>

      {/* Job description section */}
      <div className="setup-section">
        <div className="setup-label-row">
          <span className="setup-label">Job Description</span>
          <div className="jd-mode-toggle">
            <button
              type="button"
              className={`mode-btn${jdMode === "paste" ? " mode-btn--active" : ""}`}
              onClick={() => setJdMode("paste")}
            >
              Paste
            </button>
            <button
              type="button"
              className={`mode-btn${jdMode === "url" ? " mode-btn--active" : ""}`}
              onClick={() => setJdMode("url")}
            >
              URL
            </button>
          </div>
        </div>

        {jdMode === "url" ? (
          <div className="jd-url-row">
            <input
              type="url"
              className="setup-input"
              placeholder="https://jobs.example.com/role/12345"
              value={jdUrl}
              onChange={e => setJdUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFetchUrl()}
            />
            <button
              type="button"
              className="fetch-btn"
              onClick={handleFetchUrl}
              disabled={isFetchingUrl || !jdUrl.trim()}
            >
              {isFetchingUrl ? <span className="spinner spinner--sm" /> : "Fetch"}
            </button>
          </div>
        ) : (
          <textarea
            className="setup-textarea"
            placeholder="Paste the job description here…"
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={6}
          />
        )}

        {jdText && jdMode === "url" && (
          <p className="setup-fetched-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
            </svg>
            Job description fetched — switch to Paste tab to review or edit
          </p>
        )}
      </div>

      {error && <p className="setup-error">{error}</p>}

      <button
        type="button"
        className="generate-btn"
        onClick={handleGenerate}
        disabled={!canGenerate}
      >
        {isGenerating ? (
          <>
            <span className="spinner spinner--sm" />
            Generating tailored questions…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Generate Tailored Questions
          </>
        )}
      </button>

      <button
        type="button"
        className="skip-tailoring-btn"
        onClick={onPracticeGeneral}
        disabled={isGenerating}
      >
        Practice without tailored questions →
      </button>
    </div>
  )
}
