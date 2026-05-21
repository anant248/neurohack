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

  const { isReady, isRecording, isAnalyzing, results, start, stop, reset } = useFaceLandmarker()
  const { history, addSession } = useSessionHistory()

  const handleStart = async () => {
    if (!videoRef.current || !canvasRef.current) return
    await start(videoRef.current, canvasRef.current)
  }

  const handleStop = async () => {
    const result = await stop()
    if (result) {
      addSession({
        eyeContactScore: result.eyeContactScore,
        expressionScore: result.expressionScore,
      })
    }
  }

  return (
    <div className="container">
      {history.length > 0 && (
        <button className="history-btn" onClick={() => setShowHistory(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3v8h8M21 21v-8h-8M3 11c0-4.97 4.03-9 9-9 2.5 0 4.74 1.01 6.36 2.64M21 13c0 4.97-4.03 9-9 9-2.5 0-4.74-1.01-6.36-2.64"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          View History ({history.length})
        </button>
      )}

      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} history={history} />

      <header className="header-section">
        <div className="icon-badge">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 className="main-title">Let&apos;s Ace That Interview.</h1>
        <p className="subtitle">Perfect your interview presence with real-time feedback</p>
      </header>

      <QuestionSelector selectedQuestion={selectedQuestion} onSelect={setSelectedQuestion} />

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

      {results && <ResultsCard results={results} onReset={reset} />}
    </div>
  )
}
