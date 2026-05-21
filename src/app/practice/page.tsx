"use client"

import { useState, useRef } from "react"
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker"
import { useSessionHistory } from "@/hooks/useSessionHistory"
import { QuestionSelector } from "@/components/practice/QuestionSelector"
import { VideoCapture } from "@/components/practice/VideoCapture"
import { ResultsCard } from "@/components/practice/ResultsCard"
import { HistoryModal } from "@/components/practice/HistoryModal"
import "./styles.css"

export default function PracticePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedQuestion, setSelectedQuestion] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  const { isReady, isRecording, isAnalyzing, isAiLoading, results, start, stop, reset } = useFaceLandmarker()
  const { history, addSession } = useSessionHistory()

  const handleStart = async () => {
    if (!videoRef.current || !canvasRef.current) return
    await start(videoRef.current, canvasRef.current)
  }

  const handleStop = async () => {
    const result = await stop(selectedQuestion, history)
    if (result) {
      addSession({ eyeContactScore: result.eyeContactScore, expressionScore: result.expressionScore })
    }
  }

  return (
    <div className="practice-layout">
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} />

      {/* ── Top bar ── */}
      <header className="practice-topbar">
        <div className="topbar-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill="currentColor"
            />
          </svg>
          <span>Interprep</span>
        </div>
        {history.length > 0 && (
          <button className="history-btn" onClick={() => setShowHistory(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3v8h8M21 21v-8h-8M3 11c0-4.97 4.03-9 9-9 2.5 0 4.74 1.01 6.36 2.64M21 13c0 4.97-4.03 9-9 9-2.5 0-4.74-1.01-6.36-2.64"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            History ({history.length})
          </button>
        )}
      </header>

      {/* ── Two-column main ── */}
      <main className="practice-main">
        {/* Left: question picker + feedback */}
        <aside className="practice-left">
          <QuestionSelector selectedQuestion={selectedQuestion} onSelect={setSelectedQuestion} />

          <div className="feedback-area">
            {results ? (
              <ResultsCard results={results} isAiLoading={isAiLoading} onReset={reset} />
            ) : isAnalyzing ? (
              <div className="analyzing-state">
                <div className="analyzing-spinner" />
                <p className="analyzing-text">Analyzing your performance…</p>
              </div>
            ) : (
              <div className="feedback-placeholder">
                <div className="placeholder-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <p className="placeholder-title">AI feedback will appear here</p>
                <p className="placeholder-sub">Record your answer to get personalized coaching</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right: video */}
        <section className="practice-right">
          <VideoCapture
            videoRef={videoRef}
            canvasRef={canvasRef}
            isReady={isReady}
            isRecording={isRecording}
            isAnalyzing={isAnalyzing}
            hasQuestion={!!selectedQuestion}
            onStart={handleStart}
            onStop={handleStop}
          />
        </section>
      </main>
    </div>
  )
}
