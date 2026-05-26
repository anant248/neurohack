"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { LeetCodeQuestion } from "@/lib/leetcode"
import type { CodeReviewResponse } from "@/app/api/code-review/route"
import "./styles.css"

// CodeMirror is SSR-unfriendly — load client-side only
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false })

const JS_STARTER = `/**
 * Solve the problem below.
 * You can change the language with the buttons above.
 */
function solution() {

}
`

const PY_STARTER = `# Solve the problem below.
# You can change the language with the buttons above.

def solution():
    pass
`

export default function TechnicalPage() {
  const [question, setQuestion] = useState<LeetCodeQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<"js" | "py">("js")
  const [code, setCode] = useState(JS_STARTER)
  const [showWebcam, setShowWebcam] = useState(false)
  const [webcamError, setWebcamError] = useState(false)
  const [review, setReview] = useState<string | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Language extensions loaded lazily
  const [jsExt, setJsExt] = useState<unknown[]>([])
  const [pyExt, setPyExt] = useState<unknown[]>([])

  useEffect(() => {
    fetch("/api/leetcode")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch question")
        return r.json() as Promise<LeetCodeQuestion>
      })
      .then(setQuestion)
      .catch(() => setError("Could not load today's question — showing a fallback."))
      .finally(() => setLoading(false))
  }, [])

  // Load lang extensions once on client
  useEffect(() => {
    import("@codemirror/lang-javascript").then((m) => setJsExt([m.javascript()]))
    import("@codemirror/lang-python").then((m) => setPyExt([m.python()]))
  }, [])

  // Webcam
  useEffect(() => {
    if (!showWebcam) {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      return
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setWebcamError(true))
  }, [showWebcam])

  const handleLangSwitch = (next: "js" | "py") => {
    if (next === lang) return
    setLang(next)
    setCode(next === "js" ? JS_STARTER : PY_STARTER)
    setReview(null)
    setReviewError(null)
  }

  const handleReview = async () => {
    if (!question || isReviewing) return
    setIsReviewing(true)
    setReview(null)
    setReviewError(null)
    try {
      const res = await fetch("/api/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lang,
          problemTitle: question.title,
          problemContent: question.content,
        }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = (await res.json()) as CodeReviewResponse
      setReview(data.review)
    } catch {
      setReviewError("Couldn't get AI feedback — please try again.")
    } finally {
      setIsReviewing(false)
    }
  }

  const extensions = lang === "js" ? jsExt : pyExt

  return (
    <div className="technical-layout">
      <header className="technical-topbar">
        <div className="topbar-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill="currentColor"
            />
          </svg>
          Interprep
        </div>
        <Link href="/" className="topbar-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </Link>
      </header>

      <main className="technical-main">
        {/* ── Left: question ── */}
        <aside className="question-panel">
          <div className="question-header-card">
            {loading ? (
              <div className="question-loading">
                <div className="skeleton-line skeleton-line--medium" />
                <div className="skeleton-line skeleton-line--long" />
              </div>
            ) : question ? (
              <>
                <div className="question-meta">
                  <span className={`difficulty-badge ${question.difficulty}`}>{question.difficulty}</span>
                  {question.date && <span className="question-date">{question.date}</span>}
                </div>
                <div className="question-title" data-testid="question-title">{question.title}</div>
                {question.topicTags.length > 0 && (
                  <div className="topic-tags">
                    {question.topicTags.map((tag) => (
                      <span key={tag} className="topic-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="question-error">{error ?? "No question available."}</div>
            )}
          </div>

          <div className="question-body-card">
            <div className="question-label">Problem</div>
            {loading ? (
              <div className="question-loading">
                <div className="skeleton-line skeleton-line--long" />
                <div className="skeleton-line skeleton-line--medium" />
                <div className="skeleton-line skeleton-line--long" />
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-line skeleton-line--medium" />
              </div>
            ) : question ? (
              <div
                className="question-html"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />
            ) : null}
          </div>
        </aside>

        {/* ── Right: editor + feedback ── */}
        <section className="editor-panel">
          <div className="editor-toolbar">
            <button
              className={`lang-btn${lang === "js" ? " active" : ""}`}
              onClick={() => handleLangSwitch("js")}
            >
              JavaScript
            </button>
            <button
              className={`lang-btn${lang === "py" ? " active" : ""}`}
              onClick={() => handleLangSwitch("py")}
            >
              Python
            </button>
            <button
              className={`webcam-toggle-btn${showWebcam ? " active" : ""}`}
              onClick={() => {
                setWebcamError(false)
                setShowWebcam((v) => !v)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M23 7l-7 5 7 5V7z" fill="currentColor" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="currentColor" />
              </svg>
              {showWebcam ? "Hide camera" : "Show camera"}
            </button>
          </div>

          {/* CodeMirror */}
          <div className="editor-wrapper">
            <CodeMirror
              value={code}
              height="100%"
              theme="dark"
              extensions={extensions as never[]}
              onChange={(val) => {
                setCode(val)
                // Clear stale review when code changes
                if (review) {
                  setReview(null)
                  setReviewError(null)
                }
              }}
            />
          </div>

          {/* Optional webcam strip */}
          {showWebcam && (
            <div className="webcam-strip">
              {webcamError ? (
                <div className="webcam-error">Camera unavailable</div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted />
              )}
            </div>
          )}

          {/* AI Feedback button */}
          <button
            className={`review-btn${isReviewing ? " reviewing" : ""}`}
            onClick={handleReview}
            disabled={isReviewing || !question}
            data-testid="review-btn"
          >
            {isReviewing ? (
              <>
                <span className="spinner" />
                Reviewing…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4 9a1 1 0 0 1 2 0 6 6 0 0 0 6 6 1 1 0 0 1 1 1zM13 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor"/>
                </svg>
                Get AI Feedback
              </>
            )}
          </button>

          {/* Review panel */}
          {(review || reviewError) && (
            <div className={`review-panel${review ? "" : " review-panel--error"}`} data-testid="review-panel">
              {reviewError ? (
                <p className="review-error-text">{reviewError}</p>
              ) : (
                <>
                  <div className="review-panel-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3L22 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    AI Code Review
                  </div>
                  <div className="review-text">{review}</div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
