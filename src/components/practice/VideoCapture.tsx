"use client"

import { type RefObject, useEffect } from "react"
import { Button } from "@/components/ui/Button"

interface VideoCaptureProps {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  isReady: boolean
  isRecording: boolean
  isAnalyzing: boolean
  hasQuestion: boolean
  onStart: () => void
  onStop: () => void
  timeLeft?: number | null
  isTimerWarning?: boolean
  cameraError?: string | null
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function VideoCapture({
  videoRef,
  canvasRef,
  isReady,
  isRecording,
  isAnalyzing,
  hasQuestion,
  onStart,
  onStop,
  timeLeft,
  isTimerWarning,
  cameraError,
}: VideoCaptureProps) {
  // Placeholder when idle; transparent when recording so the video shows through
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (isRecording) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    canvas.width = 1280
    canvas.height = 720

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(1, "#16213e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.roundRect(canvas.width / 2 - 80, canvas.height / 2 - 55, 160, 110, 14)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(canvas.width / 2 + 68, canvas.height / 2 - 68, 20, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 34, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)"
    ctx.font = "38px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Ready to begin", canvas.width / 2, canvas.height / 2 + 90)
    ctx.font = "22px Inter, system-ui, sans-serif"
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.fillText("Select a question, then hit Start Recording", canvas.width / 2, canvas.height / 2 + 136)
  }, [isRecording, canvasRef])

  const canStart = isReady && hasQuestion && !isRecording && !isAnalyzing && !cameraError

  if (cameraError) {
    return (
      <div className="video-panel">
        <div className="camera-error-panel">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="camera-error-title">Camera Unavailable</p>
          <p className="camera-error-msg">{cameraError}</p>
          <p className="camera-error-sub">
            You can still practise using the question selector and STAR framework guide on the left.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="video-panel">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} />
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot" />
            REC
          </div>
        )}
        {isRecording && timeLeft !== null && timeLeft !== undefined && (
          <div className={`timer-overlay${isTimerWarning ? " timer-overlay--warning" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="video-controls">
        {!isRecording && !isAnalyzing && (
          <Button variant="primary" onClick={onStart} disabled={!canStart} type="button">
            {!isReady ? (
              <>
                <span className="spinner" />
                Loading model…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
                Start Recording
              </>
            )}
          </Button>
        )}

        {isRecording && (
          <Button variant="stop" onClick={onStop} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
            </svg>
            Stop &amp; Analyze
          </Button>
        )}

        {isAnalyzing && (
          <div className="analyzing-inline">
            <div className="spinner" style={{ borderTopColor: "#667eea" }} />
            <span>Analyzing your performance…</span>
          </div>
        )}
      </div>
    </div>
  )
}
