"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { AuthButton } from "@/components/auth/AuthButton"
import { keymap } from "@codemirror/view"
import { Prec } from "@codemirror/state"
import { acceptCompletion, closeCompletion, completionStatus } from "@codemirror/autocomplete"
import type { EditorView } from "@codemirror/view"
import type { LeetCodeQuestion } from "@/lib/leetcode"
import { generateStarterCode, buildPyHarnessClient, parseTestCases, getFuncName } from "@/lib/codeRunner"
import type { RunCodeResponse } from "@/app/api/run-code/route"
import type { CodeReviewResponse } from "@/app/api/code-review/route"
import type { TestResult } from "@/lib/codeRunner"
import "./styles.css"

// CodeMirror is SSR-unfriendly — load client-side only
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false })

// Prec.highest ensures this keymap fires before basicSetup's Tab→indent binding.
// acceptCompletion returns false when no completion is open, so Tab falls
// through to normal indentation in that case.
const autocompleteKeymap = Prec.highest(
  keymap.of([
    { key: "Tab", run: acceptCompletion },
    {
      key: "Enter",
      run: (view: EditorView) => {
        if (completionStatus(view.state)) {
          closeCompletion(view)
          return false // fall through → default newline+indent handler runs
        }
        return false
      },
    },
  ]),
)

const SESSION_KEY = (lang: "js" | "py") => `interprep-tech-code-${lang}`

function loadSavedCode(lang: "js" | "py"): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY(lang))
  } catch {
    return null
  }
}

function saveCode(lang: "js" | "py", code: string) {
  try {
    sessionStorage.setItem(SESSION_KEY(lang), code)
  } catch {
    // sessionStorage unavailable (SSR or private browsing edge case)
  }
}

// ── Pyodide singleton ─────────────────────────────────────────────────────────
// Module-level cache so the runtime is only loaded once per page session.

type PyodideInterface = {
  runPythonAsync: (code: string) => Promise<unknown>
}

declare global {
  interface Window {
    loadPyodide: (opts?: { indexURL?: string }) => Promise<PyodideInterface>
  }
}

let pyodideInstance: PyodideInterface | null = null
let pyodideLoading: Promise<PyodideInterface> | null = null

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance
  if (pyodideLoading) return pyodideLoading

  pyodideLoading = (async () => {
    await new Promise<void>((resolve, reject) => {
      if (typeof window.loadPyodide === "function") { resolve(); return }
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Pyodide script"))
      document.head.appendChild(script)
    })
    const instance = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
    })
    pyodideInstance = instance
    return instance
  })()

  return pyodideLoading
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TechnicalPage() {
  const [question, setQuestion] = useState<LeetCodeQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lang, setLang] = useState<"js" | "py">("js")
  const [code, setCode] = useState("")

  const [testResults, setTestResults] = useState<TestResult[] | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const [pyodideStatus, setPyodideStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")

  const [review, setReview] = useState<string | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  // Language extensions loaded lazily
  const [jsExt, setJsExt] = useState<unknown[]>([])
  const [pyExt, setPyExt] = useState<unknown[]>([])

  // Load lang extensions once on client
  useEffect(() => {
    import("@codemirror/lang-javascript").then((m) => setJsExt([m.javascript()]))
    import("@codemirror/lang-python").then((m) => setPyExt([m.python()]))
  }, [])

  // Fetch question, then init code (session storage takes priority over starter code)
  useEffect(() => {
    fetch("/api/leetcode")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch question")
        return r.json() as Promise<LeetCodeQuestion>
      })
      .then((q) => {
        setQuestion(q)
        // Init JS code — session storage takes priority
        const savedJs = loadSavedCode("js")
        const savedPy = loadSavedCode("py")
        setCode(savedJs ?? generateStarterCode(q.metaData, "js"))
        // Pre-generate py starter if nothing saved so switching feels instant
        if (!savedPy) {
          saveCode("py", generateStarterCode(q.metaData, "py"))
        }
      })
      .catch(() => {
        setFetchError("Could not load today's question — showing a fallback.")
        const savedJs = loadSavedCode("js")
        setCode(savedJs ?? "var solution = function() {\n    \n};\n")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLangSwitch = (next: "js" | "py") => {
    if (next === lang) return
    // Save current code before switching
    saveCode(lang, code)
    setLang(next)
    setTestResults(null)
    setRunError(null)
    setReview(null)
    setReviewError(null)

    // Load saved code for new lang, or generate starter
    const saved = loadSavedCode(next)
    if (saved) {
      setCode(saved)
    } else if (question) {
      const starter = generateStarterCode(question.metaData, next)
      setCode(starter)
      saveCode(next, starter)
    }
  }

  const handleCodeChange = (val: string) => {
    setCode(val)
    saveCode(lang, val)
    // Clear stale results when code changes
    if (testResults) setTestResults(null)
    if (runError) setRunError(null)
    if (review) {
      setReview(null)
      setReviewError(null)
    }
  }

  const handleRunTests = async () => {
    if (!question || isRunning) return
    setIsRunning(true)
    setTestResults(null)
    setRunError(null)

    try {
      if (lang === "js") {
        // JavaScript: server-side via Node.js vm
        const res = await fetch("/api/run-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language: "js",
            exampleTestcases: question.exampleTestcases,
            metaData: question.metaData,
            content: question.content,
          }),
        })
        const data = (await res.json()) as RunCodeResponse & { error?: string }
        if (!res.ok || data.error) {
          setRunError(data.error ?? "Execution failed.")
        } else {
          setTestResults(data.results)
        }
      } else {
        // Python: client-side via Pyodide (WebAssembly)
        if (pyodideStatus === "idle" || pyodideStatus === "error") {
          setPyodideStatus("loading")
        }
        let pyodide: PyodideInterface
        try {
          pyodide = await getPyodide()
          setPyodideStatus("ready")
        } catch {
          setPyodideStatus("error")
          setRunError("Could not load the Python runtime. Check your connection and try again.")
          return
        }

        const testCases = parseTestCases(question.exampleTestcases, question.metaData, question.content)
        if (testCases.length === 0) {
          setRunError("Could not parse test cases for this problem.")
          return
        }

        const funcName = getFuncName(question.metaData)
        const harness = buildPyHarnessClient(code, funcName, testCases)

        try {
          const resultJson = await pyodide.runPythonAsync(harness) as string
          const results = JSON.parse(resultJson) as TestResult[]
          setTestResults(results)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          // Surface Python errors as fail results (one per test case)
          const errorLine = msg.split("\n").find((l) => l.trim().length > 0) ?? "Runtime error"
          setTestResults(
            testCases.map((tc) => ({
              pass: false,
              actual: errorLine,
              expected: JSON.stringify(tc.expected),
              error: msg,
            })),
          )
        }
      }
    } catch {
      setRunError("Could not reach the execution service. Try again.")
    } finally {
      setIsRunning(false)
    }
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

  const extensions = [autocompleteKeymap, ...((lang === "js" ? jsExt : pyExt) as never[])]
  const allPassed = testResults?.every((r) => r.pass) ?? false

  const runBtnLabel = isRunning
    ? lang === "py" && pyodideStatus === "loading"
      ? "Loading Python…"
      : "Running…"
    : "Run Test Cases"

  return (
    <div className="technical-layout">
      <header className="technical-topbar">
        <div className="topbar-inner">
          <Link href="/" className="topbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="currentColor"
              />
            </svg>
            Interprep
          </Link>
          <div className="topbar-actions">
            <Link href="/practice" className="nav-link">Behavioural</Link>
            <Link href="/coffee-chats" className="nav-link">Coffee Chats</Link>
            <AuthButton />
          </div>
        </div>
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
                  <a
                    href={`https://leetcode.com/problems/${question.titleSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-link"
                    title="Open on LeetCode"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    LeetCode
                  </a>
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
              <div className="question-error">{fetchError ?? "No question available."}</div>
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

        {/* ── Right: editor + actions ── */}
        <section className="editor-panel">
          {/* Editor body: grows to fill space, overflow contained */}
          <div className="editor-body">
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
            </div>

            {/* CodeMirror */}
            <div className="editor-wrapper">
              <CodeMirror
                value={code}
                height="100%"
                theme="dark"
                extensions={extensions}
                onChange={handleCodeChange}
              />
            </div>
          </div>

          {/* Action buttons — always visible, never scrolled away */}
          <div className="action-row">
            <button
              className={`run-btn${isRunning ? " running" : ""}`}
              onClick={handleRunTests}
              disabled={isRunning || isReviewing || !question}
              data-testid="run-btn"
            >
              {isRunning ? (
                <><span className="spinner" />{runBtnLabel}</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                  </svg>
                  Run Test Cases
                </>
              )}
            </button>

            <button
              className={`review-btn${isReviewing ? " reviewing" : ""}`}
              onClick={handleReview}
              disabled={isReviewing || isRunning || !question}
              data-testid="review-btn"
            >
              {isReviewing ? (
                <><span className="spinner" />Reviewing…</>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4 9a1 1 0 0 1 2 0 6 6 0 0 0 6 6 1 1 0 0 1 1 1zM13 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor"/>
                  </svg>
                  Get AI Feedback
                </>
              )}
            </button>
          </div>

          {/* Results area — scrollable, capped height */}
          <div className="editor-results">
            {/* Test results panel */}
            {(testResults || runError) && (
              <div className={`test-results-panel${runError ? " panel--error" : allPassed ? " panel--all-pass" : ""}`} data-testid="test-results-panel">
                {runError ? (
                  <p className="panel-error-text">{runError}</p>
                ) : testResults ? (
                  <>
                    <div className="test-results-header">
                      {allPassed ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          All {testResults.length} tests passed
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="12" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="12" y1="16" x2="12.01" y2="16" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          {testResults.filter((r) => r.pass).length}/{testResults.length} tests passed
                        </>
                      )}
                    </div>
                    <div className="test-cases-list">
                      {testResults.map((r, i) => (
                        <div key={i} className={`test-case${r.pass ? " test-case--pass" : " test-case--fail"}`}>
                          <div className="test-case-header">
                            <span className={`test-badge${r.pass ? " pass" : " fail"}`}>
                              {r.pass ? "Pass" : "Fail"}
                            </span>
                            <span className="test-case-label">Case {i + 1}</span>
                          </div>
                          {!r.pass && (
                            <div className="test-case-detail">
                              <div className="test-case-row">
                                <span className="test-case-key">Expected</span>
                                <code className="test-case-val">{r.expected}</code>
                              </div>
                              <div className="test-case-row">
                                <span className="test-case-key">Got</span>
                                <code className="test-case-val test-val--fail">{r.actual}</code>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* AI Review panel */}
            {(review || reviewError) && (
              <div className={`review-panel${reviewError ? " review-panel--error" : ""}`} data-testid="review-panel">
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
          </div>
        </section>
      </main>
    </div>
  )
}
