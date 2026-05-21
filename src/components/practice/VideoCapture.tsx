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
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(canvas.width / 2 - 60, canvas.height / 2 - 40, 120, 80, 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(canvas.width / 2 + 50, canvas.height / 2 - 50, 15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 25, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = "28px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Ready to begin", canvas.width / 2, canvas.height / 2 + 80)
    ctx.font = "18px Inter, system-ui, sans-serif"
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.fillText("Select a question, then hit Start Recording", canvas.width / 2, canvas.height / 2 + 120)
  }, [isRecording, canvasRef])

  const canStart = isReady && hasQuestion && !isRecording && !isAnalyzing

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
