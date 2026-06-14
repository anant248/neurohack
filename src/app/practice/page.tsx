"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useFaceLandmarker } from "@/hooks/useFaceLandmarker"
import { useSessionHistory } from "@/hooks/useSessionHistory"
import { useInterviewTimer } from "@/hooks/useInterviewTimer"
import { useResume } from "@/hooks/useResume"
import { usePrepSession } from "@/hooks/usePrepSession"
import { useBehavioralBank } from "@/hooks/useBehavioralBank"
import { SetupPanel } from "@/components/practice/SetupPanel"
import { CompanyCard } from "@/components/practice/CompanyCard"
import { QuestionSelector } from "@/components/practice/QuestionSelector"
import { VideoCapture } from "@/components/practice/VideoCapture"
import { ResultsCard } from "@/components/practice/ResultsCard"
import { SessionNotes } from "@/components/practice/SessionNotes"
import { HistoryModal } from "@/components/practice/HistoryModal"
import { BehavioralBankModal } from "@/components/practice/BehavioralBankModal"
import { AuthButton } from "@/components/auth/AuthButton"
import type { BehavioralPrepResponse } from "@/lib/types"
import { GENERAL_BEHAVIORAL_QUESTIONS } from "@/lib/generalQuestions"
import "./styles.css"

export default function PracticePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedQuestion, setSelectedQuestion] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [showBank, setShowBank] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<"visual" | "full" | null>("visual")

  const { isReady, isRecording, isAnalyzing, isAiLoading, results, cameraError, start, stop, reset } =
    useFaceLandmarker()
  const { history, addSession, clearHistory } = useSessionHistory()
  const timer = useInterviewTimer(120)
  const { resumeText, saveResume } = useResume()
  const { session, startSession, saveNotes, endSession } = usePrepSession()
  const { entries, addEntry, updateEntry, deleteEntry } = useBehavioralBank()

  const handleStart = async () => {
    if (!videoRef.current || !canvasRef.current) return
    timer.startTimer()
    await start(videoRef.current, canvasRef.current)
  }

  const handleStop = async () => {
    timer.resetTimer()
    const result = await stop(selectedQuestion, history)
    if (result) {
      addSession({
        question: selectedQuestion,
        eyeContactScore: result.eyeContactScore,
        expressionScore: result.expressionScore,
      })
    }
  }

  const handleReset = () => {
    timer.resetTimer()
    reset()
  }

  const handleGenerate = (data: BehavioralPrepResponse, jdText: string) => {
    startSession({
      companyName: data.companyName,
      role: data.role,
      companyBlurb: data.companyBlurb,
      companyLink: data.companyLink,
      jdText,
      questions: data.questions,
    })
    setSelectedQuestion("")
    handleReset()
  }

  const handlePracticeGeneral = () => {
    startSession({
      companyName: "",
      role: "",
      companyBlurb: "",
      companyLink: "",
      jdText: "",
      questions: GENERAL_BEHAVIORAL_QUESTIONS,
    })
    setSelectedQuestion("")
    handleReset()
  }

  const handleEndSession = () => {
    endSession()
    setSelectedQuestion("")
    setAnalysisMode("visual")
    handleReset()
  }

  return (
    <div className="practice-layout">
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onClearHistory={clearHistory}
      />
      <BehavioralBankModal
        isOpen={showBank}
        onClose={() => setShowBank(false)}
        entries={entries}
        onAdd={addEntry}
        onUpdate={updateEntry}
        onDelete={deleteEntry}
      />

      {/* ── Top bar ── */}
      <header className="practice-topbar">
        <div className="topbar-inner">
        <Link href="/" className="topbar-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              fill="currentColor"
            />
          </svg>
          <span>Interprep</span>
        </Link>
        <div className="topbar-actions">
          <Link href="/technical" className="nav-link">Technical</Link>
          <Link href="/coffee-chats" className="nav-link">Coffee Chats</Link>
          <button className="history-btn" onClick={() => setShowBank(true)} type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Story Bank
          </button>
          {history.length > 0 && (
            <button className="history-btn" onClick={() => setShowHistory(true)} type="button">
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
          <AuthButton />
        </div>
        </div>
      </header>

      {/* ── Main content ── */}
      {!session ? (
        /* Step 1: Setup */
        <main className="setup-main">
          <SetupPanel
            resumeText={resumeText}
            onResumeChange={saveResume}
            onGenerate={handleGenerate}
            onPracticeGeneral={handlePracticeGeneral}
          />
        </main>
      ) : (
        /* Step 2: Active session */
        <main className="practice-main">
          {/* Left: company card (tailored only) + question + notes + feedback */}
          <aside className="practice-left">
            {session.companyName && (
              <CompanyCard
                companyName={session.companyName}
                role={session.role}
                companyBlurb={session.companyBlurb}
                companyLink={session.companyLink}
                onReset={handleEndSession}
              />
            )}
            {!session.companyName && (
              <div className="general-practice-banner">
                <span>General Practice Mode</span>
                <button type="button" className="company-reset-btn" onClick={handleEndSession}>
                  New session
                </button>
              </div>
            )}

            <QuestionSelector
              questions={session.questions}
              selectedQuestion={selectedQuestion}
              onSelect={setSelectedQuestion}
            />

            <SessionNotes
              initialNotes={session.notes}
              onSave={saveNotes}
            />

            <div className="feedback-area">
              {results ? (
                <ResultsCard results={results} isAiLoading={isAiLoading} onReset={handleReset} />
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
              timeLeft={timer.timeLeft}
              isTimerWarning={timer.isWarning}
              cameraError={cameraError}
              analysisMode={analysisMode}
              onAnalysisModeChange={setAnalysisMode}
            />
          </section>
        </main>
      )}
    </div>
  )
}
